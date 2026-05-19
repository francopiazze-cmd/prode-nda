import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "piazze@estudio-pyp.com.ar";

export async function POST(req: NextRequest) {
  // Verificar que quien llama es el admin
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { profileId } = await req.json() as { profileId: string };
  if (!profileId) {
    return NextResponse.json({ error: "Falta profileId" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      nda_client_verified: true,
      nda_client_verified_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (error) {
    console.error("Error validando cliente:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
