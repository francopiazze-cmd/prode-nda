"use client";

import { useState, useEffect } from "react";
import { isPredictionLocked, scorePrediction } from "@/lib/scoring";
import type { Match, Prediction } from "@/lib/supabase/types";

type Props = {
  match: Match;
  prediction: Prediction | null;
  onSave: (homeScore: number, awayScore: number) => Promise<void>;
};

export function MatchCard({ match, prediction, onSave }: Props) {
  const [home, setHome] = useState<number>(prediction?.home_score ?? 0);
  const [away, setAway] = useState<number>(prediction?.away_score ?? 0);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const locked = isPredictionLocked(match.utc_kickoff);
  const finished = match.status === "FINISHED";
  const live = match.status === "LIVE";
  const points = finished && prediction
    ? scorePrediction(
        prediction.home_score,
        prediction.away_score,
        match.home_score ?? 0,
        match.away_score ?? 0,
        match.stage
      )
    : null;

  useEffect(() => {
    if (savedAt === null) return;
    const t = setTimeout(() => setSavedAt(null), 2000);
    return () => clearTimeout(t);
  }, [savedAt]);

  async function handleSave() {
    if (locked || saving) return;
    setSaving(true);
    try {
      await onSave(home, away);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  const kickoff = new Date(match.utc_kickoff);
  const dateStr = kickoff.toLocaleString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires"
  });

  return (
    <div className={`card relative ${live ? "border-l-4 border-l-nda-accent glow-cyan" : ""}`}>
      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-nda-dark/60">{stageLabel(match.stage)}{match.group_letter ? ` · Grupo ${match.group_letter}` : ""}</span>
        {live ? (
          <span className="chip bg-nda-accent/20 text-nda-primary">
            <span className="inline-block w-2 h-2 rounded-full bg-nda-accent animate-pulse" /> En vivo
          </span>
        ) : (
          <span className="text-nda-dark/60">{dateStr}</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <TeamSlot name={match.home_team_name ?? "—"} />

        <div className="flex items-center gap-2">
          <ScoreInput
            value={home}
            onChange={setHome}
            disabled={locked}
          />
          <span className="text-nda-dark/40">vs</span>
          <ScoreInput
            value={away}
            onChange={setAway}
            disabled={locked}
          />
        </div>

        <TeamSlot name={match.away_team_name ?? "—"} align="right" />
      </div>

      {finished && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-nda-dark/70">
            Resultado real: <strong>{match.home_score} – {match.away_score}</strong>
          </span>
          <span className={`font-semibold ${points && points > 0 ? "text-nda-primary" : "text-nda-dark/50"}`}>
            {points !== null ? `${points} pts` : "—"}
          </span>
        </div>
      )}

      {!finished && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-nda-dark/60">
            {locked ? "Pronóstico cerrado" : "Cierra 5 min antes del kickoff"}
          </span>
          {!locked && (
            <button onClick={handleSave} disabled={saving} className="btn-primary !py-2 !px-4 text-sm">
              {saving ? "Guardando..." : savedAt ? "Guardado ✓" : prediction ? "Actualizar" : "Guardar"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TeamSlot({ name, align = "left" }: { name: string; align?: "left" | "right" }) {
  return (
    <div className={`flex-1 ${align === "right" ? "text-right" : ""}`}>
      <p className="font-semibold text-nda-dark text-sm sm:text-base">{name}</p>
    </div>
  );
}

function ScoreInput({
  value,
  onChange,
  disabled
}: {
  value: number;
  onChange: (n: number) => void;
  disabled: boolean;
}) {
  return (
    <input
      type="number"
      min={0}
      max={20}
      disabled={disabled}
      value={value}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (Number.isFinite(n) && n >= 0 && n <= 20) onChange(n);
      }}
      className="w-14 h-12 rounded-xl border border-nda-primary/20 text-center text-lg font-bold text-nda-dark bg-white focus:border-nda-primary focus:outline-none focus:ring-2 focus:ring-nda-primary/20 disabled:bg-nda-soft disabled:text-nda-dark/60"
    />
  );
}

function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    GROUP_STAGE: "Fase de grupos",
    LAST_16: "Octavos",
    QUARTER_FINALS: "Cuartos",
    SEMI_FINALS: "Semifinales",
    THIRD_PLACE: "Tercer puesto",
    FINAL: "Final"
  };
  return map[stage] ?? stage;
}
