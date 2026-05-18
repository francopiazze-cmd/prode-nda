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

  return (
    <>
      <Header user={profile} />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-extrabold text-nda-dark">Tu perfil</h1>

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
