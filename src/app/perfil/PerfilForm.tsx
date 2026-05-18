"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ARGENTINE_PROVINCES, INSURANCE_TYPES, type Profile } from "@/lib/supabase/types";

export function PerfilForm({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const [form, setForm] = useState({
    full_name: profile.full_name,
    phone: profile.phone ?? "",
    province: profile.province ?? "",
    insurances: profile.insurances ?? []
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function toggleInsurance(id: string) {
    setForm((f) => ({
      ...f,
      insurances: f.insurances.includes(id)
        ? f.insurances.filter((x) => x !== id)
        : [...f.insurances, id]
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("profiles").update(form).eq("id", profile.id);
    setSaving(false);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="font-bold text-nda-dark">Tus datos</h2>

      <div>
        <label className="block text-sm font-medium text-nda-dark mb-1">Nombre y apellido</label>
        <input
          className="input"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-nda-dark mb-1">WhatsApp</label>
        <input
          type="tel"
          className="input"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-nda-dark mb-1">Provincia</label>
        <select
          className="input"
          value={form.province}
          onChange={(e) => setForm({ ...form, province: e.target.value })}
        >
          <option value="">Elegí tu provincia</option>
          {ARGENTINE_PROVINCES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-nda-dark mb-1">Seguros que tenés</label>
        <div className="grid grid-cols-2 gap-2">
          {INSURANCE_TYPES.map((it) => {
            const checked = form.insurances.includes(it.id);
            return (
              <button
                type="button"
                key={it.id}
                onClick={() => toggleInsurance(it.id)}
                className={`rounded-xl border px-3 py-2 text-sm text-left transition ${
                  checked
                    ? "border-nda-primary bg-nda-primary text-white"
                    : "border-nda-primary/20 hover:bg-nda-soft"
                }`}
              >
                {it.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Guardando..." : savedAt ? "Guardado ✓" : "Guardar cambios"}
        </button>
        <button type="button" onClick={handleLogout} className="btn-ghost">
          Cerrar sesión
        </button>
      </div>
    </form>
  );
}
