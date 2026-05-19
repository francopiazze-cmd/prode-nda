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
                <button
                  onClick={() => handleValidate(client)}
                  disabled={loading === client.id}
                  className="btn-primary !py-2 !px-4 text-sm shrink-0"
                >
                  {loading === client.id ? "Validando..." : "Validar ✓"}
                </button>
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
