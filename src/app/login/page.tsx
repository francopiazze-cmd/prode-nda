"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/jugar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

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
            Usá el mail y contraseña con los que te registraste.
          </p>

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

          <p className="mt-4 text-sm text-center">
            <Link
              href="/recuperar-clave"
              className="text-nda-dark/60 hover:text-nda-primary underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </p>

          <p className="mt-4 text-sm text-center text-nda-dark/70">
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
