import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminClient } from "./AdminClient";

const ADMIN_EMAIL = "francopiazze@gmail.com";

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/jugar");
  }

  const admin = createAdminClient();

  const { data: pending } = await admin
    .from("profiles")
    .select("id, full_name, email, nda_license_plate, created_at")
    .eq("is_nda_client", true)
    .eq("nda_client_verified", false)
    .order("created_at", { ascending: false });

  const { data: verified } = await admin
    .from("profiles")
    .select("id, full_name, email, nda_license_plate, nda_client_verified_at")
    .eq("is_nda_client", true)
    .eq("nda_client_verified", true)
    .order("nda_client_verified_at", { ascending: false });

  return (
    <AdminClient pending={pending ?? []} verified={verified ?? []} />
  );
}
