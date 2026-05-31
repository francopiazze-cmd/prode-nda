import { NextRequest, NextResponse } from "next/server";
import { getUpcomingBookings } from "@/lib/store";
import { buildICS, CalEvent } from "@/lib/ics";
import { modalities, site } from "@/lib/config";

export const dynamic = "force-dynamic";

// Feed .ics con TODAS las reservas, para que la dueña se suscriba en su celu.
// Protegido por OWNER_FEED_TOKEN. Suscribir como:
//   webcal://TU-DOMINIO/api/calendar/feed?token=EL_TOKEN
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const expected = process.env.OWNER_FEED_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  const bookings = await getUpcomingBookings();
  const events: CalEvent[] = bookings.map((b) => {
    const modLabel = modalities[b.modality].label;
    return {
      uid: `${b.id}@nda-pole`,
      title: `${b.student_name} — Pole ${modLabel}`,
      description: `Alumna: ${b.student_name}\\nTel: ${b.student_phone}\\nEmail: ${b.student_email}`,
      start: b.starts_at,
      durationMin: b.duration_min,
    };
  });

  const ics = buildICS(events, `Reservas — ${site.name}`);
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
