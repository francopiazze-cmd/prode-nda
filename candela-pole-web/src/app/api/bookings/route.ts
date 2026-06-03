import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createBooking } from "@/lib/store";
import { notifyOwner } from "@/lib/notify";

export const dynamic = "force-dynamic";

const schema = z.object({
  slot_id: z.string().min(1),
  student_name: z.string().min(2, "Ingresá tu nombre").max(80),
  student_phone: z.string().min(6, "Ingresá tu teléfono").max(30),
  student_email: z.string().email("Email inválido").max(120),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }
  try {
    const booking = await createBooking(parsed.data);
    // Aviso a la dueña (no bloquea la respuesta si falla).
    notifyOwner(booking).catch(() => {});
    return NextResponse.json({ booking });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo reservar" },
      { status: 409 }
    );
  }
}
