import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/mail";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/jugar";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", req.url));
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, req.url));
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("profiles")
    .select("id, phone")
    .eq("id", user.id)
    .maybeSingle();

  const provider = (user.app_metadata?.provider as string) ?? "email";
  const isGoogleUser = provider === "google";

  if (!existing) {
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const fullName =
      (meta.full_name as string) ||
      (meta.name as string) ||
      (user.email?.split("@")[0] ?? "Usuario");

    const { data: codeData } = await admin.rpc("generate_referral_code");
    const referralCode = (codeData as string) || crypto.randomUUID().slice(0, 6).toUpperCase();

    if (isGoogleUser) {
      // Google: creamos perfil mínimo y mandamos a completar datos
      await admin.from("profiles").insert({
        id: user.id,
        email: user.email!,
        full_name: fullName,
        referral_code: referralCode,
        marketing_consent: false,
      });
      return NextResponse.redirect(new URL("/completar-perfil", req.url));
    } else {
      // Magic link: perfil completo desde el formulario de registro
      let referredBy: string | null = null;
      const refCode = meta.referral_code as string | undefined;
      if (refCode) {
        const { data: referrer } = await admin
          .from("profiles")
          .select("id")
          .eq("referral_code", refCode)
          .maybeSingle();
        if (referrer) referredBy = referrer.id;
      }

      const isNdaClient = Boolean(meta.is_nda_client);
      const ndaLicensePlate = isNdaClient
        ? ((meta.nda_license_plate as string) ?? null)
        : null;

      await admin.from("profiles").insert({
        id: user.id,
        email: user.email!,
        full_name: fullName,
        phone: (meta.phone as string) ?? null,
        province: (meta.province as string) ?? null,
        insurances: (meta.insurances as string[]) ?? [],
        marketing_consent: true,
        consent_at: new Date().toISOString(),
        is_nda_client: isNdaClient,
        nda_license_plate: ndaLicensePlate,
        referral_code: referralCode,
        referred_by: referredBy
      });

      try {
        await sendWelcomeEmail(user.email!, fullName, referralCode);
      } catch {
        // No bloquear el flujo si falla el mail.
      }

      return NextResponse.redirect(new URL(next, req.url));
    }
  }

  // Usuario de Google que ya tiene perfil pero no completó sus datos
  if (isGoogleUser && !existing.phone) {
    return NextResponse.redirect(new URL("/completar-perfil", req.url));
  }

  return NextResponse.redirect(new URL(next, req.url));
}
