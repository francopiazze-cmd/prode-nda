"use client";

import { useEffect, useState } from "react";
import { Booking, PublicSlot } from "@/lib/types";
import { formatDayHeading, formatTime } from "@/lib/format";
import { modalities } from "@/lib/config";

const LS_KEY = "nda-pole-student";

export default function BookingForm({
  slot,
  onBooked,
}: {
  slot: PublicSlot;
  onBooked: (b: Booking) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autocompletado: recordamos los datos de la alumna en su navegador.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setName(d.name ?? "");
        setPhone(d.phone ?? "");
        setEmail(d.email ?? "");
      }
    } catch {
      /* noop */
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot_id: slot.id,
          student_name: name.trim(),
          student_phone: phone.trim(),
          student_email: email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo reservar.");
        return;
      }
      if (remember) {
        localStorage.setItem(
          LS_KEY,
          JSON.stringify({ name, phone, email })
        );
      }
      onBooked(data.booking as Booking);
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Resumen del turno elegido */}
      <div className="card mb-4 flex items-center gap-3 p-4">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sage-100 text-xl">
          {modalities[slot.modality].emoji}
        </span>
        <div className="text-sm">
          <p className="font-display text-lg leading-tight text-ink">
            {formatDayHeading(slot.starts_at)} · {formatTime(slot.starts_at)} hs
          </p>
          <p className="text-inkSoft">
            {modalities[slot.modality].label} · {slot.duration_min} min
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label" htmlFor="name">
            Nombre y apellido
          </label>
          <input
            id="name"
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Tu nombre"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Teléfono
          </label>
          <input
            id="phone"
            type="tel"
            className="field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
            placeholder="11 2222 3333"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            inputMode="email"
            placeholder="vos@email.com"
            required
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-inkSoft">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 accent-sage-500"
          />
          Recordar mis datos en este celular
        </label>

        {error && (
          <p className="rounded-2xl bg-clay/10 p-3 text-sm text-clayDark">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Reservando…" : "Confirmar reserva"}
        </button>
      </form>
    </div>
  );
}
