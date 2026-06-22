import type { MatchStage } from "./supabase/types";

const ELIMINATION_STAGES: MatchStage[] = [
  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL"
];

/**
 * Replica en TypeScript la lógica de scoring que está también en
 * supabase/schema.sql (calculate_prediction_points). Las dos
 * implementaciones tienen que mantenerse en sync.
 */
export function scorePrediction(
  predHome: number,
  predAway: number,
  actualHome: number,
  actualAway: number,
  stage: MatchStage
): number {
  let points = 0;

  if (predHome === actualHome && predAway === actualAway) {
    points = 5;
  } else {
    const predWinner = sign(predHome - predAway);
    const actualWinner = sign(actualHome - actualAway);
    if (predWinner === actualWinner) {
      const predDiff = predHome - predAway;
      const actualDiff = actualHome - actualAway;
      points = predDiff === actualDiff ? 3 : 1;
    }
  }

  if (ELIMINATION_STAGES.includes(stage)) {
    points *= 2;
  }
  return points;
}

function sign(n: number): -1 | 0 | 1 {
  if (n > 0) return 1;
  if (n < 0) return -1;
  return 0;
}

/**
 * Cuántos minutos antes del kickoff se cierran los pronósticos.
 */
export const PREDICTION_LOCK_MINUTES = 5;

export const REFERRAL_BONUS_POINTS = 2;
export const REFERRAL_BONUS_CAP = 10;
export const NDA_CLIENT_BONUS_POINTS = 20;

export function isPredictionLocked(kickoff: Date | string, now = new Date()): boolean {
  const k = typeof kickoff === "string" ? new Date(kickoff) : kickoff;
  const lockTime = new Date(k.getTime() - PREDICTION_LOCK_MINUTES * 60_000);
  return now >= lockTime;
}
