import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  fetchAllMatches,
  fetchAllTeams,
  mapStage,
  mapStatus
} from "@/lib/football-api";

/**
 * Sincroniza la lista de partidos y equipos del Mundial 2026 desde
 * football-data.org. Crea/actualiza filas en `matches` y `teams`.
 *
 * Se llama:
 * - Una vez después de deployar (manual con curl) para cargar el fixture inicial
 * - Cada 6h por Vercel Cron para detectar cambios de horarios o nuevos partidos
 *   (los partidos de eliminatoria se cargan cuando se conocen los rivales)
 *
 * Autenticación: header `Authorization: Bearer <CRON_SECRET>`.
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
    const [teams, matches] = await Promise.all([
      fetchAllTeams(competition),
      fetchAllMatches(competition)
    ]);

    if (teams.length > 0) {
      const teamsRows = teams.map((t) => ({
        id: t.id,
        name: t.name,
        short_name: t.shortName,
        tla: t.tla,
        crest_url: t.crest,
        group_letter: t.group ?? null
      }));
      const { error: teamsErr } = await admin.from("teams").upsert(teamsRows);
      if (teamsErr) throw teamsErr;
    }

    const matchRows = matches.map((m) => ({
      id: m.id,
      utc_kickoff: m.utcDate,
      status: mapStatus(m.status),
      stage: mapStage(m.stage),
      group_letter: m.group?.replace("GROUP_", "") ?? null,
      home_team_id: m.homeTeam.id,
      away_team_id: m.awayTeam.id,
      home_team_name: m.homeTeam.name,
      away_team_name: m.awayTeam.name,
      home_score: m.score.fullTime.home,
      away_score: m.score.fullTime.away,
      updated_at: new Date().toISOString()
    }));

    if (matchRows.length > 0) {
      const { error: matchesErr } = await admin.from("matches").upsert(matchRows);
      if (matchesErr) throw matchesErr;
    }

    return NextResponse.json({
      ok: true,
      teams: teams.length,
      matches: matchRows.length
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
