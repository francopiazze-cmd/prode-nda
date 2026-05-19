"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarClavePage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${appUrl}/recuperar-clave/nueva`,
      }
    );

    setLoading(false);

    if (error) {
      setError("No pudimos enviar el mail. Intentá de nuevo.");
    } else {
      setSent(true);
    }
  }

  return (
    <main className="min-h-screen hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <Image
            src="/nda-logo.png"
            alt="NDA Asesores de Seguros"
            width={180}
            height={98}
            className="h-20 w-auto"
            priority
          />
          <span className="text-xl font-bold text-white">· Prode</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold text-nda-dark mb-1">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-nda-dark/70 mb-6">
            Te mandamos un mail con un link para crear una nueva contraseña.
          </p>

          {sent ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-nda-accent/20 border border-nda-accent/40 px-4 py-3 text-sm">
                <p className="font-semibold text-nda-dark">¡Listo! 📩</p>
                <p className="text-nda-dark/80 mt-1">
                  Revisá tu casilla de <strong>{email}</strong>. Si no aparece en
                  unos minutos, fijate en la carpeta de Spam.
                </p>
              </div>
              <Link
                href="/login"
                className="block text-center text-sm underline font-semibold text-nda-primary"
              >
                Volver a ingresar
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Enviando..." : "Mandarme el link"}
              </button>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <p className="text-sm text-center text-nda-dark/70 pt-2">
                ¿Te acordaste?{" "}
                <Link
                  href="/login"
                  className="underline font-semibold text-nda-primary"
                >
                  Volver al login
                </Link>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-white/60 mt-6">
          Prode NDA · Mundial 2026 · Organizado por NDA Asesores
        </p>
      </div>
    </main>
  );
}
