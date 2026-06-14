"use client";

import { useState } from "react";

type PendingClient = {
  id: string;
  full_name: string;
  email: string;
  nda_license_plate: string | null;
  created_at: string;
};

type VerifiedClient = {
  id: string;
  full_name: string;
  email: string;
  nda_license_plate: string | null;
  nda_client_verified_at: string | null;
};

type Props = {
  pending: PendingClient[];
  verified: VerifiedClient[];
};

export function AdminClient({ pending: initialPending, verified: initialVerified }: Props) {
  const [pending, setPending] = useState(initialPending);
  const [verified, setVerified] = useState(initialVerified);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  async function handleRefreshScores() {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const res = await fetch("/api/admin/refresh-scores", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setRefreshMsg("⚠️ Error al actualizar. Probá de nuevo en un minuto.");
      } else if (data.scoredMatches > 0) {
        setRefreshMsg(
          `✅ Listo: ${data.scoredMatches} partido(s) nuevo(s) puntuado(s). El ranking ya está actualizado.`
        );
      } else {
        setRefreshMsg("✅ Todo al día. No había partidos nuevos terminados.");
      }
    } catch {
      setRefreshMsg("⚠️ Error de conexión. Probá de nuevo.");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleValidate(client: PendingClient) {
    setLoading(client.id);
    setError(null);

    const res = await fetch("/api/admin/validate-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: client.id }),
    });

    setLoading(null);

    if (!res.ok) {
      setError("No se pudo validar. Intentá de nuevo.");
      return;
    }

    // Mover de pendiente a validado
    setPending((prev) => prev.filter((p) => p.id !== client.id));
    setVerified((prev) => [
      {
        ...client,
        nda_client_verified_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  async function handleReject(client: PendingClient) {
    const ok = window.confirm(
      `¿Rechazar a ${client.full_name}?\n\nSe marca como NO cliente NDA y desaparece de pendientes. Sigue jugando, pero sin los +20 puntos.`
    );
    if (!ok) return;

    setLoading(client.id);
    setError(null);

    const res = await fetch("/api/admin/reject-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: client.id }),
    });

    setLoading(null);

    if (!res.ok) {
      setError("No se pudo rechazar. Intentá de nuevo.");
      return;
    }

    // Sacarlo del listado de pendientes
    setPending((prev) => prev.filter((p) => p.id !== client.id));
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Argentina/Buenos_Aires",
    });
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold text-nda-dark">Panel de administración</h1>
        <p className="text-nda-dark/60 text-sm mt-1">Validación de clientes NDA — +20 puntos al aprobar</p>
      </div>

      {/* Actualizar resultados / ranking */}
      <section className="card bg-nda-primary/5 border border-nda-primary/15">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-bold text-nda-dark">Resultados y ranking</h2>
            <p className="text-sm text-nda-dark/60 mt-1 max-w-md">
              Trae los resultados de los partidos terminados, calcula los puntos
              y actualiza la tabla de posiciones. Usalo cuando termine una jornada.
            </p>
          </div>
          <button
            onClick={handleRefreshScores}
            disabled={refreshing}
            className="btn-primary !py-2.5 !px-5 shrink-0"
          >
            {refreshing ? "Actualizando..." : "🔄 Actualizar resultados ahora"}
          </button>
        </div>
        {refreshMsg && (
          <p className="text-sm mt-3 font-medium text-nda-dark">{refreshMsg}</p>
        )}
      </section>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* PENDIENTES */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-bold text-nda-dark text-lg">Pendientes de validación</h2>
          {pending.length > 0 && (
            <span className="bg-nda-accent text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {pending.length}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="card text-center py-10 text-nda-dark/50">
            <p className="text-3xl mb-2">✅</p>
            <p>No hay clientes pendientes de validación.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((client) => (
              <div key={client.id} className="card flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-nda-dark">{client.full_name}</p>
                  <p className="text-sm text-nda-dark/60">{client.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-nda-soft text-nda-dark/70 px-2 py-0.5 rounded-lg font-mono">
                      🚗 {client.nda_license_plate ?? "—"}
                    </span>
                    <span className="text-xs text-nda-dark/40">
                      Se registró el {formatDate(client.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => handleValidate(client)}
                    disabled={loading === client.id}
                    className="btn-primary !py-2 !px-4 text-sm"
                  >
                    {loading === client.id ? "..." : "Validar ✓"}
                  </button>
                  <button
                    onClick={() => handleReject(client)}
                    disabled={loading === client.id}
                    className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 text-sm transition disabled:opacity-50"
                  >
                    Rechazar ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* VALIDADOS */}
      {verified.length > 0 && (
        <section>
          <h2 className="font-bold text-nda-dark text-lg mb-4">
            Ya validados
            <span className="ml-2 text-sm font-normal text-nda-dark/40">({verified.length})</span>
          </h2>
          <div className="space-y-2">
            {verified.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-nda-soft"
              >
                <div>
                  <p className="font-medium text-nda-dark text-sm">{client.full_name}</p>
                  <p className="text-xs text-nda-dark/50">{client.email} · {client.nda_license_plate ?? "—"}</p>
                </div>
                <span className="text-xs text-nda-dark/40 shrink-0">
                  {client.nda_client_verified_at ? formatDate(client.nda_client_verified_at) : "—"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
