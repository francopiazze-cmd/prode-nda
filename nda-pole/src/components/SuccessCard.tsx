"use client";

import { Booking } from "@/lib/types";
import { formatDayHeading, formatTime } from "@/lib/format";
import { modalities, site } from "@/lib/config";
import { googleCalendarLink, CalEvent } from "@/lib/ics";

export default function SuccessCard({
  booking,
  onReset,
}: {
  booking: Booking;
  onReset: () => void;
}) {
  const modLabel = modalities[booking.modality].label;
  const ev: CalEvent = {
    uid: `${booking.id}@nda-pole`,
    title: `Clase de Pole (${modLabel}) con ${site.name}`,
    description: `Clase ${modLabel.toLowerCase()} con ${site.name}.`,
    start: booking.starts_at,
    durationMin: booking.duration_min,
  };
  const gcal = googleCalendarLink(ev);
  const ics = `/api/calendar/event?id=${booking.id}`;

  return (
    <div className="card p-6 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage-100 text-3xl">
        ✓
      </div>
      <h3 className="mt-4 font-display text-2xl text-ink">¡Reserva confirmada!</h3>
      <p className="mt-1 text-sm text-inkSoft">
        {formatDayHeading(booking.starts_at)} · {formatTime(booking.starts_at)} hs
        <br />
        {modLabel} · {booking.duration_min} min
      </p>

      <p className="mt-5 text-sm font-semibold text-inkSoft">
        Agregalo a tu calendario:
      </p>
      <div className="mt-2 grid gap-2">
        <a
          href={gcal}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full"
        >
          Agregar a Google Calendar
        </a>
        <a href={ics} className="btn-ghost w-full">
          Agregar a Apple / otro (.ics)
        </a>
      </div>

      <p className="mt-4 text-xs text-inkSoft/80">
        Te esperamos 🤍 Si necesitás reprogramar, escribime por Instagram.
      </p>

      <button
        onClick={onReset}
        className="mt-5 text-sm font-semibold text-clay underline-offset-4 hover:underline"
      >
        Reservar otra clase
      </button>
    </div>
  );
}
