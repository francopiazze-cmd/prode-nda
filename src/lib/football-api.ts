/**
 * Cliente para football-data.org API v4.
 * Docs: https://www.football-data.org/documentation/quickstart
 *
 * El plan gratis permite 10 requests/minuto. La función fetchJson
 * implementa retry con backoff cuando se topa con 429.
 */

import type { MatchStage, MatchStatus } from "./supabase/types";

const BASE_URL = "https://api.football-data.org/v4";

type FdMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  homeTeam: { id: number | null; name: string | null; tla: string | null; crest: string | null };
  awayTeam: { id: number | null; name: string | null; tla: string | null; crest: string | null };
  score: {
    fullTime: { home: number | null; away: number | null };
    winner: string | null;
  };
};

type FdTeam = {
  id: number;
  name: string;
  shortName: string | null;
  tla: string | null;
  crest: string | null;
  group?: string | null;
};

async function fetchJson<T>(path: string, attempt = 0): Promise<T> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) throw new Error("FOOTBALL_DATA_API_KEY no configurada");

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "X-Auth-Token": apiKey },
    cache: "no-store"
  });

  if (res.status === 429 && attempt < 3) {
    const delay = (attempt + 1) * 6000;
    await new Promise((r) => setTimeout(r, delay));
    return fetchJson<T>(path, attempt + 1);
  }

  if (!res.ok) {
    throw new Error(`football-data ${path} ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function fetchAllMatches(competition: string): Promise<FdMatch[]> {
  const data = await fetchJson<{ matches: FdMatch[] }>(`/competitions/${competition}/matches`);
  return data.matches;
}

export async function fetchAllTeams(competition: string): Promise<FdTeam[]> {
  const data = await fetchJson<{ teams: FdTeam[] }>(`/competitions/${competition}/teams`);
  return data.teams;
}

export function mapStage(stage: string): MatchStage {
  const map: Record<string, MatchStage> = {
    GROUP_STAGE: "GROUP_STAGE",
    LAST_16: "LAST_16",
    QUARTER_FINALS: "QUARTER_FINALS",
    SEMI_FINALS: "SEMI_FINALS",
    THIRD_PLACE: "THIRD_PLACE",
    FINAL: "FINAL"
  };
  return map[stage] ?? "GROUP_STAGE";
}

export function mapStatus(status: string): MatchStatus {
  const map: Record<string, MatchStatus> = {
    SCHEDULED: "SCHEDULED",
    TIMED: "SCHEDULED",
    IN_PLAY: "LIVE",
    PAUSED: "LIVE",
    LIVE: "LIVE",
    FINISHED: "FINISHED",
    AWARDED: "FINISHED",
    POSTPONED: "POSTPONED",
    SUSPENDED: "POSTPONED",
    CANCELLED: "CANCELED"
  };
  return map[status] ?? "SCHEDULED";
}

export type { FdMatch, FdTeam };
