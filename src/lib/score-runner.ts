import { createAdminClient } from "@/lib/supabase/server";
import {
  fetchAllMatches,
  mapStatus,
  mapStage,
  type FdMatch,
} from "@/lib/football-api";
import { scorePrediction } from "@/lib/scoring";
import type { Match, MatchStage } from "@/lib/supabase/types";

export type ScoreResult = {
  checked: number;
  scoredMatches: number;
  updatedPredictions: number;
};

/**
 * Sincroniza resultados desde football-data.org, puntúa los pronósticos de
 * los partidos que terminaron y todavía no fueron puntuados (scored_at null),
 * y refresca la vista materializada del leaderboard.
 *
 * Fuente de verdad de "ya puntuado" = matches.scored_at (NO la transición de
 * status), porque sync-fixtures puede haber marcado el partido como FINISHED.
 */
export async function runScoring(): Promise<ScoreResult> {
  const competition = process.env.FOOTBALL_DATA_COMPETITION || "WC";
  const admin = createAdminClient();

  const remoteMatches = await fetchAllMatches(competition);

  const relevant = remoteMatches.filter((m) =>
    ["FINISHED", "AWARDED", "IN_PLAY", "PAUSED", "LIVE"].includes(m.status)
  );

  const { data: localMatchesRaw } = await admin
    .from("matches")
    .select("id, status, home_score, away_score, stage, scored_at")
    .in("id", relevant.map((m) => m.id));
  const localMap = new Map<
    number,
    Pick<Match, "id" | "status" | "home_score" | "away_score" | "stage" | "scored_at">
  >((localMatchesRaw ?? []).map((m) => [m.id, m as any]));

  let scoredMatches = 0;
  let updatedPredictions = 0;

  for (const fd of relevant) {
    const newStatus = mapStatus(fd.status);
    const newStage = mapStage(fd.stage);
    const local = localMap.get(fd.id);

    await admin
      .from("matches")
      .update({
        status: newStatus,
        home_score: fd.score.fullTime.home,
        away_score: fd.score.fullTime.away,
        stage: newStage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fd.id);

    const alreadyScored = !!local?.scored_at;
    if (
      newStatus === "FINISHED" &&
      !alreadyScored &&
      fd.score.fullTime.home != null &&
      fd.score.fullTime.away != null
    ) {
      const updated = await scoreAllPredictionsForMatch(admin, fd, newStage);
      updatedPredictions += updated;
      scoredMatches++;
      await admin
        .from("matches")
        .update({ scored_at: new Date().toISOString() })
        .eq("id", fd.id);
    }
  }

  if (scoredMatches > 0) {
    await admin.rpc("refresh_leaderboard");
  }

  return { checked: relevant.length, scoredMatches, updatedPredictions };
}

async function scoreAllPredictionsForMatch(
  admin: ReturnType<typeof createAdminClient>,
  match: FdMatch,
  stage: MatchStage
): Promise<number> {
  const homeScore = match.score.fullTime.home as number;
  const awayScore = match.score.fullTime.away as number;

  const { data: preds } = await admin
    .from("predictions")
    .select("id, home_score, away_score")
    .eq("match_id", match.id);

  if (!preds || preds.length === 0) return 0;

  const byPoints = new Map<number, string[]>();
  for (const p of preds) {
    const pts = scorePrediction(p.home_score, p.away_score, homeScore, awayScore, stage);
    const arr = byPoints.get(pts) ?? [];
    arr.push(p.id);
    byPoints.set(pts, arr);
  }

  for (const [points, ids] of byPoints) {
    await admin.from("predictions").update({ points_awarded: points }).in("id", ids);
  }

  return preds.length;
}
