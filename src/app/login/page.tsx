"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/jugar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError("Mail o contraseña incorrectos. Verificá tus datos.");
    } else {
      router.push(next);
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
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
          <h1 className="text-2xl font-extrabold text-nda-dark mb-1">Ingresar</h1>
          <p className="text-sm text-nda-dark/70 mb-6">
            Usá tu mail y contraseña, o entrá con Google.
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full inline-flex items-center justify-center gap-3 rounded-xl border-2 border-nda-dark/10 px-5 py-3 font-semibold text-nda-dark hover:bg-nda-soft transition"
          >
            <GoogleIcon /> Continuar con Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs text-nda-dark/40 uppercase tracking-wider">
            <div className="flex-1 h-px bg-nda-dark/10" /> o{" "}
            <div className="flex-1 h-px bg-nda-dark/10" />
          </div>

          {/* Mail + contraseña */}
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <p className="mt-6 text-sm text-center text-nda-dark/70">
            ¿No tenés cuenta?{" "}
            <Link
              href="/registro"
              className="underline font-semibold text-nda-primary"
            >
              Registrate gratis
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/60 mt-6">
          Prode NDA · Mundial 2026 · Organizado por NDA Asesores
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
