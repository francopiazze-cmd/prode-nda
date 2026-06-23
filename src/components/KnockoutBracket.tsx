"use client";

import type { Match, MatchStage } from "@/lib/supabase/types";

/** Etapas del cuadro principal, en orden (sin tercer puesto) */
const STAGES: { key: MatchStage; label: string }[] = [
  { key: "LAST_32", label: "Eliminatoria de 32" },
  { key: "LAST_16", label: "Octavos de final" },
  { key: "QUARTER_FINALS", label: "Cuartos de final" },
  { key: "SEMI_FINALS", label: "Semifinales" },
  { key: "FINAL", label: "Final" },
];

const TZ = "America/Argentina/Buenos_Aires";

// Geometría del cuadro
const CARD_W = 184;
const CARD_H = 74;
const GAP = 18; // separación vertical entre partidos de 32avos
const HGAP = 54; // separación horizontal entre columnas
const UNIT = CARD_H + GAP;
const HEAD_H = 40; // alto del título de columna

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: TZ,
  });
  const time = d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TZ,
  });
  return `${day} · ${time} hs`;
}

export function KnockoutBracket({ matches }: { matches: Match[] }) {
  // Agrupar por etapa y ordenar por fecha
  const byStage = new Map<MatchStage, Match[]>();
  for (const m of matches) {
    const arr = byStage.get(m.stage) ?? [];
    arr.push(m);
    byStage.set(m.stage, arr);
  }
  for (const arr of byStage.values()) {
    arr.sort(
      (a, b) =>
        new Date(a.utc_kickoff).getTime() - new Date(b.utc_kickoff).getTime()
    );
  }

  const rounds = STAGES.map((s) => byStage.get(s.key) ?? []);
  const nFirst = rounds[0].length || 16;

  // Centro vertical (y) de cada partido en cada ronda
  const centers: number[][] = [];
  centers[0] = Array.from({ length: nFirst }, (_, i) => (i + 0.5) * UNIT);
  for (let r = 1; r < rounds.length; r++) {
    const prev = centers[r - 1];
    const count = Math.max(1, Math.ceil(prev.length / 2));
    centers[r] = Array.from({ length: count }, (_, i) =>
      prev[2 * i] != null && prev[2 * i + 1] != null
        ? (prev[2 * i] + prev[2 * i + 1]) / 2
        : prev[2 * i] ?? (i + 0.5) * UNIT
    );
  }

  const canvasH = nFirst * UNIT;
  const colX = (r: number) => r * (CARD_W + HGAP);
  const canvasW = colX(STAGES.length - 1) + CARD_W;

  // Conexiones (líneas) entre rondas
  const paths: string[] = [];
  for (let r = 1; r < rounds.length; r++) {
    const childRightX = colX(r - 1) + CARD_W;
    const thisLeftX = colX(r);
    const midX = childRightX + HGAP / 2;
    centers[r].forEach((yThis, i) => {
      const yTop = centers[r - 1][2 * i];
      const yBot = centers[r - 1][2 * i + 1];
      if (yTop != null)
        paths.push(`M ${childRightX} ${yTop} H ${midX} V ${yThis}`);
      if (yBot != null)
        paths.push(`M ${childRightX} ${yBot} H ${midX} V ${yThis}`);
      paths.push(`M ${midX} ${yThis} H ${thisLeftX}`);
    });
  }

  const thirdPlace = byStage.get("THIRD_PLACE")?.[0];

  return (
    <div className="space-y-4">
      <div className="overflow-auto max-h-[70vh] rounded-2xl border border-nda-primary/10 bg-nda-soft/30 p-3">
        {/* Títulos de columnas */}
        <div className="relative" style={{ width: canvasW, height: HEAD_H }}>
          {STAGES.map((s, r) => (
            <div
              key={s.key}
              className="absolute text-center text-xs font-bold uppercase tracking-wide text-nda-dark/60"
              style={{ left: colX(r), top: 8, width: CARD_W }}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Lienzo del cuadro */}
        <div
          className="relative"
          style={{ width: canvasW, height: canvasH }}
        >
          {/* Líneas conectoras */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={canvasW}
            height={canvasH}
          >
            {paths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="rgba(10,20,82,0.18)"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
          </svg>

          {/* Tarjetas de partidos */}
          {rounds.map((arr, r) =>
            arr.map((m, i) => {
              const y = centers[r][i] ?? (i + 0.5) * UNIT;
              return (
                <div
                  key={m.id}
                  className="absolute"
                  style={{
                    left: colX(r),
                    top: y - CARD_H / 2,
                    width: CARD_W,
                    height: CARD_H,
                  }}
                >
                  <BracketMatch match={m} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tercer puesto, aparte del cuadro */}
      {thirdPlace && (
        <div className="max-w-xs">
          <p className="text-xs font-bold uppercase tracking-wide text-nda-dark/60 mb-1">
            Tercer puesto
          </p>
          <BracketMatch match={thirdPlace} />
        </div>
      )}
    </div>
  );
}

function BracketMatch({ match }: { match: Match }) {
  return (
    <div className="h-full rounded-xl border border-nda-primary/15 bg-white px-2.5 py-1.5 shadow-sm flex flex-col justify-center">
      <p className="text-[10px] text-nda-dark/45 mb-1 leading-none">
        {fmtDate(match.utc_kickoff)}
      </p>
      <TeamRow name={match.home_team_name} score={match.home_score} />
      <div className="h-px bg-nda-primary/10 my-0.5" />
      <TeamRow name={match.away_team_name} score={match.away_score} />
    </div>
  );
}

function TeamRow({
  name,
  score,
}: {
  name: string | null;
  score: number | null;
}) {
  const defined = !!name;
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 min-w-0">
        <svg
          viewBox="0 0 24 24"
          className={`w-3.5 h-4 shrink-0 ${
            defined ? "text-nda-accent" : "text-nda-dark/25"
          }`}
          fill="currentColor"
        >
          <path d="M12 2l8 3v6c0 4.5-3.2 8.3-8 9-4.8-.7-8-4.5-8-9V5l8-3z" />
        </svg>
        <span
          className={`text-xs truncate ${
            defined
              ? "font-semibold text-nda-dark"
              : "text-nda-dark/40 italic"
          }`}
        >
          {name ?? "A definir"}
        </span>
      </div>
      {score != null && (
        <span className="text-xs font-bold text-nda-dark">{score}</span>
      )}
    </div>
  );
}
