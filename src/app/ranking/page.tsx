import { Header } from "@/components/Header";
import { Leaderboard } from "@/components/Leaderboard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { LeaderboardRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: rows }] = await Promise.all([
    supabase.from("profiles").select("full_name, referral_code").eq("id", user.id).single(),
    supabase.from("leaderboard").select("*").order("total_points", { ascending: false }).limit(200)
  ]);

  return (
    <>
      <Header user={profile} />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold text-nda-dark mb-1">Tabla de posiciones</h1>
        <p className="text-sm text-nda-dark/70 mb-6">
          Top 200. Se actualiza después de cada partido.
        </p>
        <Leaderboard rows={(rows as LeaderboardRow[]) ?? []} currentUserId={user.id} />
      </main>
    </>
  );
}
