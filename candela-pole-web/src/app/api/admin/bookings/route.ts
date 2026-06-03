import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getAllBookings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdmin(req))
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  const bookings = await getAllBookings();
  return NextResponse.json({ bookings });
}
