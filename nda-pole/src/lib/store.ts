import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { Booking, Modality, PublicSlot, Slot } from "./types";
import { site } from "./config";

// =====================================================================
// Capa de datos. Si hay credenciales de Supabase, usa Supabase.
// Si no, cae en un store en memoria (MODO DEMO) con turnos de ejemplo,
// para poder previsualizar el sitio sin configurar nada.
// =====================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseEnabled = Boolean(SUPABASE_URL && SERVICE_KEY);

let supabase: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL!, SERVICE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return supabase;
}

function toPublic(s: Slot): PublicSlot {
  return {
    id: s.id,
    modality: s.modality,
    starts_at: s.starts_at,
    duration_min: s.duration_min,
    spots_left: Math.max(0, s.capacity - s.booked_count),
    location: s.location,
    meeting_link: s.meeting_link,
    note: s.note,
  };
}

// ---------------------------------------------------------------------
// MODO DEMO (memoria). Se reinicia con el server.
// ---------------------------------------------------------------------
const demo = (() => {
  function seedSlots(): Slot[] {
    const out: Slot[] = [];
    const now = new Date();
    for (let d = 1; d <= 10; d++) {
      const day = new Date(now);
      day.setDate(now.getDate() + d);
      // Presencial: 18hs y 19hs algunos días
      if (d % 2 === 1) {
        for (const h of [18, 19]) {
          const start = new Date(day);
          start.setHours(h, 0, 0, 0);
          out.push({
            id: randomUUID(),
            modality: "presencial",
            starts_at: start.toISOString(),
            duration_min: site.defaultDurationMin,
            capacity: 4,
            booked_count: 0,
            location: "Estudio NDA Pole — (cargá tu dirección en el panel)",
            meeting_link: null,
            note: null,
            created_at: new Date().toISOString(),
          });
        }
      }
      // Virtual: 10hs días pares
      if (d % 2 === 0) {
        const start = new Date(day);
        start.setHours(10, 0, 0, 0);
        out.push({
          id: randomUUID(),
          modality: "virtual",
          starts_at: start.toISOString(),
          duration_min: site.defaultDurationMin,
          capacity: 1,
          booked_count: 0,
          location: null,
          meeting_link: "https://meet.google.com/xxx-xxxx-xxx",
          note: null,
          created_at: new Date().toISOString(),
        });
      }
    }
    return out;
  }
  return {
    slots: seedSlots(),
    bookings: [] as Booking[],
  };
})();

// ---------------------------------------------------------------------
// API pública del store
// ---------------------------------------------------------------------

export async function getAvailableSlots(modality: Modality): Promise<PublicSlot[]> {
  const nowIso = new Date().toISOString();
  if (isSupabaseEnabled) {
    const { data, error } = await db()
      .from("availability_slots")
      .select("*")
      .eq("modality", modality)
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data as Slot[])
      .filter((s) => s.capacity - s.booked_count > 0)
      .map(toPublic);
  }
  return demo.slots
    .filter(
      (s) =>
        s.modality === modality &&
        s.starts_at >= nowIso &&
        s.capacity - s.booked_count > 0
    )
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .map(toPublic);
}

export async function getAllSlots(): Promise<Slot[]> {
  if (isSupabaseEnabled) {
    const { data, error } = await db()
      .from("availability_slots")
      .select("*")
      .order("starts_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data as Slot[];
  }
  return [...demo.slots].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export async function createSlot(
  input: Omit<Slot, "id" | "booked_count" | "created_at">
): Promise<Slot> {
  const row: Slot = {
    ...input,
    id: randomUUID(),
    booked_count: 0,
    created_at: new Date().toISOString(),
  };
  if (isSupabaseEnabled) {
    const { data, error } = await db()
      .from("availability_slots")
      .insert({
        modality: row.modality,
        starts_at: row.starts_at,
        duration_min: row.duration_min,
        capacity: row.capacity,
        location: row.location,
        meeting_link: row.meeting_link,
        note: row.note,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return data as Slot;
  }
  demo.slots.push(row);
  return row;
}

export async function deleteSlot(id: string): Promise<void> {
  if (isSupabaseEnabled) {
    const { error } = await db().from("availability_slots").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  demo.slots = demo.slots.filter((s) => s.id !== id);
}

export async function getSlot(id: string): Promise<Slot | null> {
  if (isSupabaseEnabled) {
    const { data, error } = await db()
      .from("availability_slots")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Slot) ?? null;
  }
  return demo.slots.find((s) => s.id === id) ?? null;
}

export interface NewBookingInput {
  slot_id: string;
  student_name: string;
  student_phone: string;
  student_email: string;
}

export async function createBooking(input: NewBookingInput): Promise<Booking> {
  const slot = await getSlot(input.slot_id);
  if (!slot) throw new Error("El turno ya no existe.");
  if (slot.starts_at < new Date().toISOString())
    throw new Error("Ese turno ya pasó.");
  if (slot.capacity - slot.booked_count <= 0)
    throw new Error("Ese turno ya no tiene lugar.");

  const booking: Booking = {
    id: randomUUID(),
    slot_id: slot.id,
    modality: slot.modality,
    starts_at: slot.starts_at,
    duration_min: slot.duration_min,
    student_name: input.student_name,
    student_phone: input.student_phone,
    student_email: input.student_email,
    status: "confirmed",
    created_at: new Date().toISOString(),
  };

  if (isSupabaseEnabled) {
    // Reserva atómica vía función RPC que chequea capacidad y suma booked_count.
    const { data, error } = await db().rpc("book_slot", {
      p_slot_id: input.slot_id,
      p_name: input.student_name,
      p_phone: input.student_phone,
      p_email: input.student_email,
    });
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Ese turno ya no tiene lugar.");
    return data as Booking;
  }

  slot.booked_count += 1;
  demo.bookings.push(booking);
  return booking;
}

export async function getBooking(id: string): Promise<Booking | null> {
  if (isSupabaseEnabled) {
    const { data, error } = await db()
      .from("bookings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Booking) ?? null;
  }
  return demo.bookings.find((b) => b.id === id) ?? null;
}

export async function getUpcomingBookings(): Promise<Booking[]> {
  const nowIso = new Date().toISOString();
  if (isSupabaseEnabled) {
    const { data, error } = await db()
      .from("bookings")
      .select("*")
      .eq("status", "confirmed")
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data as Booking[];
  }
  return demo.bookings
    .filter((b) => b.status === "confirmed" && b.starts_at >= nowIso)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

export async function getAllBookings(): Promise<Booking[]> {
  if (isSupabaseEnabled) {
    const { data, error } = await db()
      .from("bookings")
      .select("*")
      .order("starts_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data as Booking[];
  }
  return [...demo.bookings].sort((a, b) =>
    a.starts_at.localeCompare(b.starts_at)
  );
}
