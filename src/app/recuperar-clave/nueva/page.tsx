"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NuevaClavePage() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  // Cuando llega del link del mail, Supabase setea automáticamente la sesión
  // a partir del hash de la URL. Esperamos a que esté listo.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        // Esperar el evento de PASSWORD_RECOVERY
        const { data: sub } = supabase.auth.onAuthStateChange((event) => {
          if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
            setReady(true);
          }
        });
        return () => sub.subscription.unsubscribe();
      }
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/jugar"), 1500);
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
            Nueva contraseña
          </h1>
          <p className="text-sm text-nda-dark/70 mb-6">
            Elegí tu contraseña nueva.
          </p>

          {done ? (
            <div className="rounded-xl bg-nda-accent/20 border border-nda-accent/40 px-4 py-3 text-sm">
              <p className="font-semibold text-nda-dark">¡Listo! ✓</p>
              <p className="text-nda-dark/80 mt-1">
                Te llevamos al juego en un segundo...
              </p>
            </div>
          ) : !ready ? (
            <div className="text-center py-6">
              <div className="inline-block w-8 h-8 border-4 border-nda-primary/20 border-t-nda-primary rounded-full animate-spin" />
              <p className="text-sm text-nda-dark/60 mt-3">Validando el link...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                required
                autoComplete="new-password"
                placeholder="Nueva contraseña (mín. 8)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                minLength={8}
              />
              <input
                type="password"
                required
                autoComplete="new-password"
                placeholder="Repetir contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? "Guardando..." : "Guardar y entrar"}
              </button>

              {error && <p className="text-sm text-red-600">{error}</p>}
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
