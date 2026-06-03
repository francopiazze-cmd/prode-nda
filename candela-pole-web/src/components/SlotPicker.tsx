"use client";

import { useEffect, useMemo, useState } from "react";
import { Modality, PublicSlot } from "@/lib/types";
import { dayKey, formatDayHeading, formatTime } from "@/lib/format";
import { modalities } from "@/lib/config";

export default function SlotPicker({
  modality,
  onPick,
}: {
  modality: Modality;
  onPick: (s: PublicSlot) => void;
}) {
  const [slots, setSlots] = useState<PublicSlot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setSlots(null);
    setError(null);
    fetch(`/api/slots?modality=${modality}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        if (d.error) setError(d.error);
        else setSlots(d.slots);
      })
      .catch(() => active && setError("No se pudo cargar la disponibilidad."));
    return () => {
      active = false;
    };
  }, [modality]);

  // Agrupar por día
  const byDay = useMemo(() => {
    const map = new Map<string, PublicSlot[]>();
    (slots ?? []).forEach((s) => {
      const k = dayKey(s.starts_at);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
    });
    return map;
  }, [slots]);

  const days = useMemo(() => Array.from(byDay.keys()).sort(), [byDay]);

  useEffect(() => {
    if (days.length && !selectedDay) setSelectedDay(days[0]);
  }, [days, selectedDay]);

  if (error) {
    return (
      <p className="rounded-2xl bg-clay/10 p-4 text-sm text-clayDark">{error}</p>
    );
  }

  if (!slots) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-2xl bg-sand/60"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="font-display text-lg text-ink">
          Por ahora no hay turnos {modalities[modality].label.toLowerCase()}.
        </p>
        <p className="mt-1 text-sm text-inkSoft">
          Volvé pronto o escribime por Instagram.
        </p>
      </div>
    );
  }

  const daySlots = selectedDay ? byDay.get(selectedDay) ?? [] : [];

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-inkSoft">
        Disponibilidad {modalities[modality].label.toLowerCase()}
      </p>

      {/* Selector de día (scroll horizontal) */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {days.map((d) => {
          const sample = byDay.get(d)![0];
          const active = d === selectedDay;
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`shrink-0 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "border-sage-400 bg-sage-500 text-cream"
                  : "border-sand bg-white/60 text-ink hover:bg-white"
              }`}
            >
              {formatDayHeading(sample.starts_at)}
            </button>
          );
        })}
      </div>

      {/* Horarios del día elegido */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {daySlots.map((s) => (
          <button
            key={s.id}
            onClick={() => onPick(s)}
            className="card flex flex-col items-start gap-0.5 p-4 text-left transition active:scale-[0.98] hover:border-sage-300"
          >
            <span className="font-display text-lg text-ink">
              {formatTime(s.starts_at)} hs
            </span>
            <span className="text-xs text-inkSoft">
              {s.duration_min} min ·{" "}
              {s.spots_left === 1 ? "1 lugar" : `${s.spots_left} lugares`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
