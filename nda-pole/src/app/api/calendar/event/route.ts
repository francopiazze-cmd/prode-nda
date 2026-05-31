import { NextRequest, NextResponse } from "next/server";
import { getBooking } from "@/lib/store";
import { buildICS, CalEvent } from "@/lib/ics";
import { modalities, site } from "@/lib/config";

export const dynamic = "force-dynamic";

// Descarga del .ics de una reserva (para que la alumna lo agregue a su calendario).
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "falta id" }, { status: 400 });

  const booking = await getBooking(id);
  if (!booking)
    return NextResponse.json({ error: "no encontrada" }, { status: 404 });

  const modLabel = modalities[booking.modality].label;
  const ev: CalEvent = {
    uid: `${booking.id}@nda-pole`,
    title: `Clase de Pole (${modLabel}) con ${site.name}`,
    description:
      booking.modality === "virtual"
        ? `Clase virtual con ${site.name}.`
        : `Clase presencial con ${site.name}.`,
    start: booking.starts_at,
    durationMin: booking.duration_min,
  };

  const ics = buildICS([ev]);
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="clase-pole.ics"`,
    },
  });
}
