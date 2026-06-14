import { Header } from "@/components/Header";
import { ReferralBox } from "@/components/ReferralBox";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PerfilForm } from "./PerfilForm";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <p className="p-8 text-center">Cargando perfil...</p>;
  }

  // Cuántos amigos referidos jugaron al menos 1 pronóstico
  const { count: confirmedReferrals } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", user.id)
    .eq("bonus_awarded", true);

  // ─── Desglose de pronósticos ───
  // points_awarded se setea solo cuando el partido terminó:
  //   5/10 = exacto · 3/6 = diferencia · 1/2 = ganador · 0 = errado
  const { data: scoredPreds } = await supabase
    .from("predictions")
    .select("points_awarded")
    .eq("user_id", user.id)
    .not("points_awarded", "is", null);

  const { count: totalPreds } = await supabase
    .from("predictions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const stats = { exacto: 0, diferencia: 0, ganador: 0, errado: 0, puntos: 0 };
  for (const p of scoredPreds ?? []) {
    const pts = p.points_awarded ?? 0;
    stats.puntos += pts;
    if (pts === 5 || pts === 10) stats.exacto++;
    else if (pts === 3 || pts === 6) stats.diferencia++;
    else if (pts === 1 || pts === 2) stats.ganador++;
    else stats.errado++;
  }
  const jugados = scoredPreds?.length ?? 0;

  // Posición en el ranking
  const { data: myRow } = await supabase
    .from("leaderboard")
    .select("total_points")
    .eq("user_id", user.id)
    .maybeSingle();
  const myTotal = myRow?.total_points ?? 0;
  const { count: ahead } = await supabase
    .from("leaderboard")
    .select("*", { count: "exact", head: true })
    .gt("total_points", myTotal);
  const rank = (ahead ?? 0) + 1;

  return (
    <>
      <Header user={profile} />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-extrabold text-nda-dark">Tu perfil</h1>

        {/* Rendimiento */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-nda-dark">Tu rendimiento</h2>
            <span className="chip bg-nda-primary/10 text-nda-primary">
              Puesto #{rank}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-extrabold text-nda-primary">{myTotal}</span>
            <span className="text-sm text-nda-dark/60">puntos totales</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatTile
              emoji="🎯"
              label="Exactos"
              value={stats.exacto}
              cls="bg-nda-success/15 text-nda-dark border border-nda-success/40"
            />
            <StatTile
              emoji="👌"
              label="Diferencia"
              value={stats.diferencia}
              cls="bg-nda-accent/15 text-nda-primary border border-nda-accent/40"
            />
            <StatTile
              emoji="✓"
              label="Ganador"
              value={stats.ganador}
              cls="bg-nda-primary/10 text-nda-primary border border-nda-primary/20"
            />
            <StatTile
              emoji="✗"
              label="Errados"
              value={stats.errado}
              cls="bg-nda-dark/5 text-nda-dark/50 border border-nda-dark/10"
            />
          </div>

          <p className="text-xs text-nda-dark/60 mt-3">
            {stats.puntos} pts por pronósticos · {jugados} de {totalPreds ?? 0}{" "}
            partidos ya jugados. El resto suma cuando se jueguen.
          </p>
        </div>

        <ReferralBox code={profile.referral_code} />

        <div className="card">
          <p className="text-sm text-nda-dark/70">Amigos confirmados</p>
          <p className="text-3xl font-bold text-nda-primary">{confirmedReferrals ?? 0}</p>
          <p className="text-xs text-nda-dark/60 mt-1">
            Cada uno te suma 2 puntos al ranking principal, hasta 10 amigos (máx. 20 pts).
            {confirmedReferrals && confirmedReferrals > 10 ? (
              <> Llevás <strong>{confirmedReferrals - 10}</strong> referidos extra para el ranking Embajadores.</>
            ) : null}
          </p>
        </div>

        {profile.is_nda_client && (
          <div className="card border-2 border-nda-accent">
            <p className="text-sm text-nda-dark/70">Bonus asegurado NDA</p>
            {profile.nda_client_verified ? (
              <>
                <p className="text-3xl font-bold text-nda-primary">+20 pts</p>
                <p className="text-xs text-nda-dark/60 mt-1">
                  ¡Validado! Ya tenés tus puntos de ventaja sumados al ranking.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-nda-dark/70">Pendiente de validación</p>
                <p className="text-xs text-nda-dark/60 mt-1">
                  Estamos verificando tu patente <strong>{profile.nda_license_plate}</strong> contra tu póliza.
                  Cuando confirmemos, sumamos los 20 puntos a tu cuenta.
                </p>
              </>
            )}
          </div>
        )}

        <PerfilForm profile={profile} />
      </main>
    </>
  );
}

function StatTile({
  emoji,
  label,
  value,
  cls,
}: {
  emoji: string;
  label: string;
  value: number;
  cls: string;
}) {
  return (
    <div className={`rounded-xl px-3 py-3 text-center ${cls}`}>
      <p className="text-xl font-extrabold leading-none">{value}</p>
      <p className="text-[11px] font-medium mt-1">
        {emoji} {label}
      </p>
    </div>
  );
}
