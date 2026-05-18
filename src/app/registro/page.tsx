"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ARGENTINE_PROVINCES, INSURANCE_TYPES } from "@/lib/supabase/types";

export default function RegistroPage() {
  const router = useRouter();
  const search = useSearchParams();
  const ref = search.get("ref");
  const supabase = createClient();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    province: "",
    insurances: [] as string[],
    is_nda_client: false,
    nda_license_plate: "",
    consent: false,
  });
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${appUrl}/auth/callback?next=/jugar`,
      },
    });
  }

  useEffect(() => {
    if (!ref) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("referral_code", ref)
      .maybeSingle()
      .then(({ data }) => setReferrerName(data?.full_name ?? null));
  }, [ref, supabase]);

  function toggleInsurance(id: string) {
    setForm((f) => ({
      ...f,
      insurances: f.insurances.includes(id)
        ? f.insurances.filter((x) => x !== id)
        : [...f.insurances, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!form.consent) {
      setError("Tenés que aceptar el tratamiento de datos para continuar.");
      return;
    }
    if (form.is_nda_client && !form.nda_license_plate.trim()) {
      setError("Cargá la patente del auto asegurado para que podamos validar tu bonus.");
      return;
    }

    setLoading(true);

    // 1. Crear usuario en Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    if (signUpError) {
      setError(
        signUpError.message === "User already registered"
          ? "Ya existe una cuenta con ese mail. ¿Querés ingresar?"
          : signUpError.message
      );
      setLoading(false);
      return;
    }

    if (!signUpData.user) {
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    // 2. Crear el perfil en nuestra tabla via API route (necesita service_role)
    const res = await fetch("/api/create-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        province: form.province || null,
        insurances: form.insurances,
        is_nda_client: form.is_nda_client,
        nda_license_plate: form.is_nda_client
          ? form.nda_license_plate.trim().toUpperCase()
          : null,
        referral_code: ref || null,
      }),
    });

    if (!res.ok) {
      setError("Cuenta creada, pero hubo un problema guardando tu perfil. Contactanos.");
      setLoading(false);
      return;
    }

    router.push("/jugar");
  }

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Image src="/nda-monogram-blue.png" alt="NDA" width={64} height={26} className="h-7 w-auto" />
        <span className="text-nda-primary font-bold">Prode</span>
      </Link>

      <h1 className="text-3xl font-extrabold text-nda-dark mb-2">Crear cuenta</h1>
      <p className="text-nda-dark/70 mb-6">Tarda menos de 1 minuto.</p>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full inline-flex items-center justify-center gap-3 rounded-xl border-2 border-nda-dark/10 px-5 py-3 font-semibold text-nda-dark hover:bg-nda-soft transition mb-4"
      >
        <GoogleIcon /> Registrarse con Google
      </button>

      <div className="flex items-center gap-3 text-xs text-nda-dark/40 uppercase tracking-wider mb-4">
        <div className="flex-1 h-px bg-nda-dark/10" /> o registrate con mail{" "}
        <div className="flex-1 h-px bg-nda-dark/10" />
      </div>

      {referrerName && (
        <div className="mb-6 rounded-xl bg-nda-accent/20 border border-nda-accent/40 px-4 py-3 text-sm">
          Te invitó <strong>{referrerName}</strong>. Cuando hagas tu primer pronóstico, ¡le sumás 2 puntos!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre y apellido">
          <input
            required
            className="input"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="Juan Pérez"
          />
        </Field>

        <Field label="Email">
          <input
            required
            type="email"
            autoComplete="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="tu@email.com"
          />
        </Field>

        <Field label="Contraseña" hint="Mínimo 8 caracteres.">
          <input
            required
            type="password"
            autoComplete="new-password"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="········"
            minLength={8}
          />
        </Field>

        <Field label="Confirmar contraseña">
          <input
            required
            type="password"
            autoComplete="new-password"
            className="input"
            value={form.confirm_password}
            onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
            placeholder="········"
          />
        </Field>

        <Field label="WhatsApp" hint="Solo para avisos del prode. Nunca llamamos sin avisar.">
          <input
            type="tel"
            autoComplete="tel"
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+54 11 1234-5678"
          />
        </Field>

        <Field label="Provincia">
          <select
            required
            className="input"
            value={form.province}
            onChange={(e) => setForm({ ...form, province: e.target.value })}
          >
            <option value="">Elegí tu provincia</option>
            {ARGENTINE_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>

        <Field label="¿Qué seguros tenés contratados?" hint="Opcional. Marcá los que correspondan.">
          <div className="grid grid-cols-2 gap-2">
            {INSURANCE_TYPES.map((it) => {
              const checked = form.insurances.includes(it.id);
              return (
                <button
                  type="button"
                  key={it.id}
                  onClick={() => toggleInsurance(it.id)}
                  className={`rounded-xl border px-3 py-2 text-sm text-left transition ${
                    checked
                      ? "border-nda-primary bg-nda-primary text-white"
                      : "border-nda-primary/20 hover:bg-nda-soft"
                  }`}
                >
                  {it.label}
                </button>
              );
            })}
          </div>
        </Field>

        {/* NDA Client block */}
        <div className="rounded-2xl border-2 border-nda-accent bg-nda-accent/10 p-4 space-y-3">
          <div>
            <p className="font-bold text-nda-dark text-sm uppercase tracking-wider">
              ¿Sos cliente de NDA? Arrancás con +20 puntos
            </p>
            <p className="text-xs text-nda-dark/70 mt-1">
              Si tenés una póliza activa con nosotros, cargá tu patente y la validamos en 48 hs. hábiles.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, is_nda_client: true })}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                form.is_nda_client
                  ? "border-nda-primary bg-nda-primary text-white"
                  : "border-nda-primary/20 bg-white hover:bg-nda-soft"
              }`}
            >
              Sí, soy cliente
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, is_nda_client: false, nda_license_plate: "" })}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                !form.is_nda_client
                  ? "border-nda-primary bg-nda-primary text-white"
                  : "border-nda-primary/20 bg-white hover:bg-nda-soft"
              }`}
            >
              No, todavía no
            </button>
          </div>

          {form.is_nda_client && (
            <Field
              label="Patente del auto asegurado"
              hint="Si no tenés seguro de auto, escribí el número de póliza."
            >
              <input
                className="input uppercase"
                value={form.nda_license_plate}
                onChange={(e) => setForm({ ...form, nda_license_plate: e.target.value })}
                placeholder="AB123CD"
                maxLength={20}
              />
            </Field>
          )}
        </div>

        <label className="flex items-start gap-3 text-sm text-nda-dark/80">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            className="mt-1"
          />
          <span>
            Acepto recibir comunicaciones de NDA Asesores sobre el prode y servicios de seguros, y el
            tratamiento de mis datos según la{" "}
            <Link href="/legal/privacidad" className="underline">política de privacidad</Link>.
          </span>
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creando cuenta..." : "Crear cuenta y jugar"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <p className="text-sm text-center text-nda-dark/70">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="underline font-semibold text-nda-primary">
            Ingresar
          </Link>
        </p>
      </form>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-nda-dark mb-1">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-nda-dark/60">{hint}</p>}
    </div>
  );
}
