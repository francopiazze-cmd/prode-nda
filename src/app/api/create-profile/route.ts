import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  const admin = createAdminClient();

  // Intentar obtener el usuario por token Bearer (registro nuevo) o por cookie (sesión existente)
  let user = null;
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    const { data } = await admin.auth.getUser(token);
    user = data.user;
  }
  if (!user) {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json() as {
    full_name: string;
    phone: string | null;
    province: string | null;
    insurances: string[];
    is_nda_client: boolean;
    nda_license_plate: string | null;
    referral_code: string | null;
  };

  // Verificar que el perfil no exista ya
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, already_exists: true });
  }

  // Buscar referidor
  let referredBy: string | null = null;
  if (body.referral_code) {
    const { data: referrer } = await admin
      .from("profiles")
      .select("id")
      .eq("referral_code", body.referral_code)
      .maybeSingle();
    if (referrer) referredBy = referrer.id;
  }

  // Generar código de referido único
  const { data: codeData } = await admin.rpc("generate_referral_code");
  const referralCode =
    (codeData as string) || crypto.randomUUID().slice(0, 6).toUpperCase();

  // Crear perfil completo
  const { error } = await admin.from("profiles").insert({
    id: user.id,
    email: user.email!,
    full_name: body.full_name,
    phone: body.phone,
    province: body.province,
    insurances: body.insurances ?? [],
    is_nda_client: body.is_nda_client ?? false,
    nda_license_plate: body.nda_license_plate ?? null,
    marketing_consent: true,
    consent_at: new Date().toISOString(),
    referral_code: referralCode,
    referred_by: referredBy,
  });

  if (error) {
    console.error("Error creando perfil:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mandar mail de bienvenida
  try {
    await sendWelcomeEmail(user.email!, body.full_name, referralCode);
  } catch (err) {
    console.error("Error enviando mail de bienvenida:", err);
  }

  return NextResponse.json({ ok: true });
}
