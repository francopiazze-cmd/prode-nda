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

  return (
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
            const rowStyles =
              isMe
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
                className={`border-t border-nda-primary/10 ${rowStyles}`}
              >
                <td className="px-4 py-3 text-nda-dark/70 font-bold">
                  <PositionBadge pos={pos} />
                </td>
                <td className="px-4 py-3 text-nda-dark">
                  {row.full_name}
                  {isMe && <span className="ml-1 text-xs text-nda-primary">(vos)</span>}
                </td>
                <td className="px-4 py-3 text-right text-nda-primary font-bold">{row.total_points}</td>
                <td className="px-4 py-3 text-right hidden sm:table-cell text-nda-dark/70">{row.exact_hits}</td>
                <td className="px-4 py-3 text-right hidden sm:table-cell text-nda-dark/70">{row.referral_count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PositionBadge({ pos }: { pos: number }) {
  if (pos === 1) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-nda-accent text-nda-dark">🏆</span>;
  if (pos === 2) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-nda-success text-nda-dark">🥈</span>;
  if (pos === 3) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-nda-primary/20 text-nda-primary">🥉</span>;
  return <span className="text-nda-dark/60">{pos}</span>;
}
