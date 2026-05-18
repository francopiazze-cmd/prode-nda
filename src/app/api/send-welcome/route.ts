import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/mail";

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, referral_code")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });

  try {
    await sendWelcomeEmail(user.email!, profile.full_name, profile.referral_code);
  } catch (err) {
    console.error("Error enviando mail de bienvenida:", err);
  }

  return NextResponse.json({ ok: true });
}
