import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  fetchAllMatches,
  mapStatus,
  mapStage,
  type FdMatch
} from "@/lib/football-api";
import { scorePrediction } from "@/lib/scoring";
import type { Match, MatchStage } from "@/lib/supabase/types";

/**
 * Detecta partidos que pasaron a FINISHED, actualiza el resultado en DB
 * y calcula puntos para todas las predicciones de ese match. Después
 * refresca la vista materializada del leaderboard.
 *
 * Corre cada 5 minutos durante el Mundial.
 */
export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const competition = process.env.FOOTBALL_DATA_COMPETITION || "WC";
  const admin = createAdminClient();

  try {
    const remoteMatches = await fetchAllMatches(competition);

    // Solo nos interesan los que están terminados o en vivo (para detectar
    // transición a FINISHED en próximos pulls).
    const relevant = remoteMatches.filter((m) =>
      ["FINISHED", "AWARDED", "IN_PLAY", "PAUSED", "LIVE"].includes(m.status)
    );

    const { data: localMatchesRaw } = await admin
      .from("matches")
      .select("id, status, home_score, away_score, stage")
      .in("id", relevant.map((m) => m.id));
    const localMap = new Map<number, Pick<Match, "id" | "status" | "home_score" | "away_score" | "stage">>(
      (localMatchesRaw ?? []).map((m) => [m.id, m as any])
    );

    let scoredMatches = 0;
    let updatedPredictions = 0;

    for (const fd of relevant) {
      const newStatus = mapStatus(fd.status);
      const newStage = mapStage(fd.stage);
      const local = localMap.get(fd.id);

      // Sincronizar el match
      await admin
        .from("matches")
        .update({
          status: newStatus,
          home_score: fd.score.fullTime.home,
          away_score: fd.score.fullTime.away,
          stage: newStage,
          scored_at: newStatus === "FINISHED" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", fd.id);

      // Si recién pasó a FINISHED, calcular puntos
      const wasUnscored = local && local.status !== "FINISHED";
      if (newStatus === "FINISHED" && wasUnscored && fd.score.fullTime.home != null && fd.score.fullTime.away != null) {
        const updated = await scoreAllPredictionsForMatch(admin, fd, newStage);
        updatedPredictions += updated;
        scoredMatches++;
      }
    }

    // Refrescar la vista materializada del leaderboard
    if (scoredMatches > 0) {
      await admin.rpc("refresh_leaderboard");
    }

    return NextResponse.json({
      ok: true,
      checked: relevant.length,
      scoredMatches,
      updatedPredictions
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
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

  // Hacemos updates en lotes para evitar muchas requests sueltas.
  const updates = preds.map((p) => ({
    id: p.id,
    points_awarded: scorePrediction(p.home_score, p.away_score, homeScore, awayScore, stage)
  }));

  // Supabase no permite update masivo con valores distintos por fila en una
  // sola query, así que agrupamos por puntos y disparamos un update por grupo.
  const byPoints = new Map<number, string[]>();
  for (const u of updates) {
    const arr = byPoints.get(u.points_awarded) ?? [];
    arr.push(u.id);
    byPoints.set(u.points_awarded, arr);
  }

  for (const [points, ids] of byPoints) {
    await admin.from("predictions").update({ points_awarded: points }).in("id", ids);
  }

  return preds.length;
}
