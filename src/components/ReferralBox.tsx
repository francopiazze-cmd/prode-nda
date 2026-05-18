"use client";

import { useState } from "react";

export function ReferralBox({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const link = `${appUrl}/r/${code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `Estoy jugando el Prode del Mundial 2026 con NDA. Sumate y competí por una Smart TV: ${link}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-nda-primary to-nda-dark text-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wider opacity-80">Tu link de invitación</p>
      <p className="mt-1 font-bold text-lg break-all">{link}</p>
      <p className="text-sm opacity-90 mt-2">
        Cada amigo que se registre con tu link y juegue al menos un pronóstico te suma <strong>+2 puntos</strong>, hasta 10 amigos (máx. 20 pts al ranking). Si invitás más, competís por el <strong>premio Embajador</strong>.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={copy} className="bg-white/15 hover:bg-white/25 rounded-xl px-4 py-2 text-sm font-medium">
          {copied ? "Copiado ✓" : "Copiar link"}
        </button>
        <button onClick={shareWhatsApp} className="bg-nda-accent text-nda-dark rounded-xl px-4 py-2 text-sm font-bold">
          Compartir por WhatsApp
        </button>
      </div>
    </div>
  );
}
