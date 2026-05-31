"use client";

import { useCallback, useEffect, useState } from "react";
import { Booking, Modality, Slot } from "@/lib/types";
import { formatDayHeading, formatTime } from "@/lib/format";
import { modalities, site } from "@/lib/config";

const PW_KEY = "nda-pole-admin-pw";

export default function AdminClient() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  // Form de nuevo turno
  const [modality, setModality] = useState<Modality>("presencial");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(site.defaultDurationMin);
  const [capacity, setCapacity] = useState(1);
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [note, setNote] = useState("");

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${pw}`,
    }),
    [pw]
  );

  const load = useCallback(async () => {
    const [s, b] = await Promise.all([
      fetch("/api/admin/slots", { headers: headers() }),
      fetch("/api/admin/bookings", { headers: headers() }),
    ]);
    if (s.status === 401 || b.status === 401) {
      setAuthed(false);
      setMsg("Contraseña incorrecta.");
      localStorage.removeItem(PW_KEY);
      return;
    }
    setSlots((await s.json()).slots ?? []);
    setBookings((await b.json()).bookings ?? []);
    setAuthed(true);
    setMsg(null);
  }, [headers]);

  useEffect(() => {
    const saved = localStorage.getItem(PW_KEY);
    if (saved) setPw(saved);
  }, []);

  useEffect(() => {
    if (pw && !authed) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pw]);

  function login(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem(PW_KEY, pw);
    load();
  }

  async function addSlot(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!date || !time) {
      setMsg("Cargá fecha y hora.");
      return;
    }
    const starts_at = new Date(`${date}T${time}`).toISOString();
    const res = await fetch("/api/admin/slots", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        modality,
        starts_at,
        duration_min: Number(duration),
        capacity: Number(capacity),
        location: modality === "presencial" ? location || null : null,
        meeting_link: modality === "virtual" ? meetingLink || null : null,
        note: note || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error ?? "No se pudo crear el turno.");
      return;
    }
    setDate("");
    setTime("");
    setNote("");
    setMsg("Turno agregado ✓");
    load();
  }

  async function removeSlot(id: string) {
    if (!confirm("¿Eliminar este turno?")) return;
    await fetch(`/api/admin/slots?id=${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    load();
  }

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-5">
        <h1 className="font-display text-3xl text-ink">Panel</h1>
        <p className="mt-1 text-sm text-inkSoft">Acceso de {site.name}.</p>
        <form onSubmit={login} className="mt-6 space-y-3">
          <input
            type="password"
            className="field"
            placeholder="Contraseña"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
          />
          <button className="btn-primary w-full">Entrar</button>
          {msg && <p className="text-sm text-clayDark">{msg}</p>}
        </form>
      </main>
    );
  }

  const bookingsBySlot = new Map<string, number>();
  bookings.forEach((b) =>
    bookingsBySlot.set(b.slot_id, (bookingsBySlot.get(b.slot_id) ?? 0) + 1)
  );

  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Panel</h1>
        <button
          onClick={() => {
            localStorage.removeItem(PW_KEY);
            setAuthed(false);
            setPw("");
          }}
          className="text-sm font-semibold text-clay"
        >
          Salir
        </button>
      </div>

      {/* Nuevo turno */}
      <section className="card mt-6 p-5">
        <h2 className="font-display text-xl text-ink">Agregar disponibilidad</h2>
        <form onSubmit={addSlot} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(["presencial", "virtual"] as Modality[]).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setModality(m)}
                className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                  modality === m
                    ? "border-sage-400 bg-sage-500 text-cream"
                    : "border-sand bg-white text-ink"
                }`}
              >
                {modalities[m].emoji} {modalities[m].label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Fecha</label>
              <input
                type="date"
                className="field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Hora</label>
              <input
                type="time"
                className="field"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Duración (min)</label>
              <input
                type="number"
                min={15}
                step={15}
                className="field"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Cupos</label>
              <input
                type="number"
                min={1}
                className="field"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </div>
          </div>
          {modality === "presencial" ? (
            <div>
              <label className="label">Dirección / estudio</label>
              <input
                className="field"
                placeholder="Dónde es la clase"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className="label">Link de videollamada</label>
              <input
                className="field"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="label">Nota (opcional)</label>
            <input
              className="field"
              placeholder="Nivel, qué traer, etc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <button className="btn-primary w-full">Agregar turno</button>
          {msg && <p className="text-center text-sm text-clayDark">{msg}</p>}
        </form>
      </section>

      {/* Turnos cargados */}
      <section className="mt-8">
        <h2 className="font-display text-xl text-ink">Turnos cargados</h2>
        <div className="mt-3 space-y-2">
          {slots.length === 0 && (
            <p className="text-sm text-inkSoft">Todavía no hay turnos.</p>
          )}
          {slots.map((s) => (
            <div
              key={s.id}
              className="card flex items-center justify-between p-4"
            >
              <div className="text-sm">
                <p className="font-semibold text-ink">
                  {formatDayHeading(s.starts_at)} · {formatTime(s.starts_at)} hs
                </p>
                <p className="text-inkSoft">
                  {modalities[s.modality].label} · {s.duration_min}min ·{" "}
                  {bookingsBySlot.get(s.id) ?? 0}/{s.capacity} reservado
                </p>
              </div>
              <button
                onClick={() => removeSlot(s.id)}
                className="text-sm font-semibold text-clayDark"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Reservas */}
      <section className="mt-8">
        <h2 className="font-display text-xl text-ink">Reservas</h2>
        <div className="mt-3 space-y-2">
          {bookings.length === 0 && (
            <p className="text-sm text-inkSoft">Sin reservas aún.</p>
          )}
          {bookings.map((b) => (
            <div key={b.id} className="card p-4 text-sm">
              <p className="font-semibold text-ink">
                {b.student_name} · {modalities[b.modality].label}
              </p>
              <p className="text-inkSoft">
                {formatDayHeading(b.starts_at)} · {formatTime(b.starts_at)} hs
              </p>
              <p className="text-inkSoft">
                {b.student_phone} · {b.student_email}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
