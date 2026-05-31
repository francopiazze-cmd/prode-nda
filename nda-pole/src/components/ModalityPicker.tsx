"use client";

import { Modality } from "@/lib/types";
import { modalities } from "@/lib/config";

// Los "botones modernos" de modalidad: Presencial / Virtual.
export default function ModalityPicker({
  onPick,
}: {
  onPick: (m: Modality) => void;
}) {
  const items = [modalities.presencial, modalities.virtual];
  return (
    <div className="grid gap-3">
      {items.map(
        (m) => (
          <button
            key={m.key}
            onClick={() => onPick(m.key)}
            className="card group flex items-center gap-4 p-5 text-left transition active:scale-[0.99] hover:border-sage-300"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sage-100 text-2xl">
              {m.emoji}
            </span>
            <span className="flex-1">
              <span className="block font-display text-xl text-ink">
                {m.label}
              </span>
              <span className="block text-sm text-inkSoft">{m.desc}</span>
            </span>
            <span className="text-2xl text-sage-400 transition group-hover:translate-x-0.5">
              →
            </span>
          </button>
        )
      )}
    </div>
  );
}
