"use client";

import { useState } from "react";
import type { LeaderboardRow } from "@/lib/supabase/types";

type Props = {
  rows: LeaderboardRow[];
  currentUserId: string | null;
};

export function Leaderboard({ rows, currentUserId }: Props) {
  // Desempate: total_points desc, exact_hits desc, argentina_hits desc, registered_at asc
  const sorted = [...rows].sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    if (b.exact_hits !== a.exact_hits) return b.exact_hits - a.exact_hits;
    if (b.argentina_hits !== a.argentina_hits) return b.argentina_hits - a.argentina_hits;
    return new Date(a.registered_at).getTime() - new Date(b.registered_at).getTime();
  });

  // Popup de rendimiento: guardamos la fila y su posición
  const [selected, setSelected] = useState<{ row: LeaderboardRow; pos: number } | null>(null);

  return (
    <>
      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-nda-soft text-nda-dark/70 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3 w-12">#</th>
              <th className="text-left px-4 py-3">Jugador</th>
              <th className="text-right px-4 py-3">Pts</th>
              <th className="text-right px-4 py-3 hidden sm:table-cell">Exactos</th>
              <th className="text-right px-4 py-3 hidden sm:table-cell">Refs</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-nda-dark/60">
                  Todavía no se jugaron partidos. Cargá tus pronósticos antes del primer match.
                </td>
              </tr>
            )}
            {sorted.map((row, idx) => {
              const isMe = row.user_id === currentUserId;
              const pos = idx + 1;
              const rowStyles = isMe
                ? "bg-nda-accent/15 font-semibold"
                : pos === 1
                  ? "bg-nda-accent/10"
                  : pos === 2
                    ? "bg-nda-success/10"
                    : pos === 3
                      ? "bg-nda-primary/5"
                      : "";
              return (
                <tr
                  key={row.user_id}
                  onClick={() => setSelected({ row, pos })}
                  className={`border-t border-nda-primary/10 cursor-pointer hover:bg-nda-soft/70 transition ${rowStyles}`}
                >
                  <td className="px-4 py-3 text-nda-dark/70 font-bold">
                    <PositionBadge pos={pos} />
                  </td>
                  <td className="px-4 py-3 text-nda-dark">
                    <span className="underline decoration-nda-primary/20 decoration-dotted underline-offset-4">
                      {row.full_name}
                    </span>
                    {isMe && <span className="ml-1 text-xs text-nda-primary">(vos)</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-nda-primary font-bold">{row.total_points}</td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell text-nda-dark/70">{row.aciertos_exactos ?? row.exact_hits}</td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell text-nda-dark/70">{row.referral_count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-center text-xs text-nda-dark/50 mt-3">
        Tocá un nombre para ver su rendimiento 👆
      </p>

      {selected && (
        <PerformanceModal
          row={selected.row}
          pos={selected.pos}
          isMe={selected.row.user_id === currentUserId}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function PerformanceModal({
  row,
  pos,
  isMe,
  onClose,
}: {
  row: LeaderboardRow;
  pos: number;
  isMe: boolean;
  onClose: () => void;
}) {
  // Partidos jugados con pronóstico = suma del desglose (siempre coincide
  // con los 4 cuadritos, sin importar si algún match recién terminó).
  const jugados =
    (row.aciertos_exactos ?? 0) +
    (row.aciertos_diferencia ?? 0) +
    (row.aciertos_ganador ?? 0) +
    (row.errados ?? 0);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-nda-dark/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-nda-soft text-nda-dark/60 flex items-center justify-center hover:bg-nda-primary/10"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="chip bg-nda-primary/10 text-nda-primary">Puesto #{pos}</span>
          {isMe && <span className="text-xs text-nda-primary font-semibold">(vos)</span>}
        </div>
        <h3 className="text-lg font-extrabold text-nda-dark pr-8">{row.full_name}</h3>

        <div className="flex items-baseline gap-2 mt-3 mb-4">
          <span className="text-4xl font-extrabold text-nda-primary">{row.total_points}</span>
          <span className="text-sm text-nda-dark/60">puntos totales</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatTile emoji="🎯" label="Exactos" value={row.aciertos_exactos ?? 0} cls="bg-nda-success/15 text-nda-dark border border-nda-success/40" />
          <StatTile emoji="👌" label="Diferencia" value={row.aciertos_diferencia ?? 0} cls="bg-nda-accent/15 text-nda-primary border border-nda-accent/40" />
          <StatTile emoji="✓" label="Ganador" value={row.aciertos_ganador ?? 0} cls="bg-nda-primary/10 text-nda-primary border border-nda-primary/20" />
          <StatTile emoji="✗" label="Errados" value={row.errados ?? 0} cls="bg-nda-dark/5 text-nda-dark/50 border border-nda-dark/10" />
        </div>

        <p className="text-xs text-nda-dark/60 mt-3">
          {row.prediction_points ?? 0} pts en {jugados}{" "}
          {jugados === 1 ? "partido jugado" : "partidos jugados"}.
          {row.referral_count > 0 && (
            <> · {row.referral_count}{" "}
              {row.referral_count === 1 ? "amigo invitado" : "amigos invitados"}.</>
          )}
        </p>
      </div>
    </div>
  );
}

function StatTile({ emoji, label, value, cls }: { emoji: string; label: string; value: number; cls: string }) {
  return (
    <div className={`rounded-xl px-3 py-3 text-center ${cls}`}>
      <p className="text-xl font-extrabold leading-none">{value}</p>
      <p className="text-[11px] font-medium mt-1">{emoji} {label}</p>
    </div>
  );
}

function PositionBadge({ pos }: { pos: number }) {
  if (pos === 1) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-nda-accent text-nda-dark">🏆</span>;
  if (pos === 2) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-nda-success text-nda-dark">🥈</span>;
  if (pos === 3) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-nda-primary/20 text-nda-primary">🥉</span>;
  return <span className="text-nda-dark/60">{pos}</span>;
}
