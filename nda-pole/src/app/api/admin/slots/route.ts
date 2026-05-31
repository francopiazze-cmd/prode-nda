import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/auth";
import { createSlot, deleteSlot, getAllSlots } from "@/lib/store";
import { site } from "@/lib/config";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  modality: z.enum(["presencial", "virtual"]),
  starts_at: z.string().min(1), // ISO
  duration_min: z.number().int().positive().max(600).default(site.defaultDurationMin),
  capacity: z.number().int().positive().max(50).default(1),
  location: z.string().max(200).nullable().optional(),
  meeting_link: z.string().max(300).nullable().optional(),
  note: z.string().max(300).nullable().optional(),
});

export async function GET(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  const slots = await getAllSlots();
  return NextResponse.json({ slots });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const slot = await createSlot({
    modality: d.modality,
    starts_at: new Date(d.starts_at).toISOString(),
    duration_min: d.duration_min,
    capacity: d.capacity,
    location: d.location ?? null,
    meeting_link: d.meeting_link ?? null,
    note: d.note ?? null,
  });
  return NextResponse.json({ slot });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "falta id" }, { status: 400 });
  await deleteSlot(id);
  return NextResponse.json({ ok: true });
}
