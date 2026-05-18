import { Header } from "@/components/Header";
import { JugarClient } from "./JugarClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function JugarPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: matches }, { data: predictions }] = await Promise.all([
    supabase.from("profiles").select("full_name, referral_code").eq("id", user.id).single(),
    supabase
      .from("matches")
      .select("*")
      .order("utc_kickoff", { ascending: true }),
    supabase.from("predictions").select("*").eq("user_id", user.id)
  ]);

  return (
    <>
      <Header user={profile} />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold text-nda-dark mb-1">Tus pronósticos</h1>
        <p className="text-sm text-nda-dark/70 mb-6">
          Cargá tus resultados antes de cada partido. Hasta 5 minutos antes del kickoff podés modificarlos.
        </p>
        <JugarClient
          matches={matches ?? []}
          predictions={predictions ?? []}
          referralCode={profile?.referral_code ?? ""}
        />
      </main>
    </>
  );
}
