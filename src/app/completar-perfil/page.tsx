"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { ARGENTINE_PROVINCES, INSURANCE_TYPES } from "@/lib/supabase/types";

export default function CompletarPerfilPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  const [form, setForm] = useState({
    phone: "",
    province: "",
    insurances: [] as string[],
    is_nda_client: false,
    nda_license_plate: "",
    consent: false,
  });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      // Verificar si ya completó el perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.phone) {
        router.replace("/jugar");
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email ?? "");
      setLoading(false);
    });
  }, [router, supabase]);

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
    if (!form.consent) {
      setError("Tenés que aceptar el tratamiento de datos para continuar.");
      return;
    }
    if (form.is_nda_client && !form.nda_license_plate.trim()) {
      setError("Cargá la patente para que podamos validar tu bonus.");
      return;
    }
    if (!userId) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        phone: form.phone.trim() || null,
        province: form.province || null,
        insurances: form.insurances,
        is_nda_client: form.is_nda_client,
        nda_license_plate: form.is_nda_client
          ? form.nda_license_plate.trim().toUpperCase()
          : null,
        marketing_consent: true,
        consent_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    // Enviar mail de bienvenida
    try {
      await fetch("/api/send-welcome", { method: "POST" });
    } catch {
      // No bloquear si falla el mail
    }

    router.push("/jugar");
  }

  if (loading) {
    return (
      <main className="min-h-screen hero-gradient flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen hero-gradient py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Image
            src="/nda-logo.png"
            alt="NDA Asesores de Seguros"
            width={180}
            height={98}
            className="h-16 w-auto"
            priority
          />
          <span className="text-xl font-bold text-white">· Prode</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold text-nda-dark mb-1">
            ¡Ya casi estás!
          </h1>
          <p className="text-sm text-nda-dark/70 mb-6">
            Completá estos datos una sola vez y empezá a jugar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="WhatsApp" hint="Solo para avisos del prode." required>
              <input
                required
                type="tel"
                autoComplete="tel"
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+54 11 1234-5678"
              />
            </Field>

            <Field label="Provincia" required>
              <select
                required
                className="input"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
              >
                <option value="">Elegí tu provincia</option>
                {ARGENTINE_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="¿Qué seguros tenés?"
              hint="Opcional. Marcá los que correspondan."
            >
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
                  Si tenés una póliza activa con nosotros, sumás 20 puntos de
                  ventaja apenas validemos tu patente.
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
                  onClick={() =>
                    setForm({ ...form, is_nda_client: false, nda_license_plate: "" })
                  }
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
                  hint="La validamos contra tu póliza. Si no tenés auto, escribí el número de póliza."
                >
                  <input
                    className="input uppercase"
                    value={form.nda_license_plate}
                    onChange={(e) =>
                      setForm({ ...form, nda_license_plate: e.target.value })
                    }
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
                Acepto recibir comunicaciones de NDA Asesores sobre el prode y
                servicios de seguros, y el tratamiento de mis datos según la{" "}
                <a
                  href="/legal/privacidad"
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  política de privacidad
                </a>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? "Guardando..." : "¡Empezar a jugar!"}
            </button>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </div>

        <p className="text-center text-xs text-white/60 mt-6">
          Entraste con Google · {userEmail}
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-nda-dark mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-nda-dark/60">{hint}</p>}
    </div>
  );
}
