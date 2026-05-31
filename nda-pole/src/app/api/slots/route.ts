import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/store";
import { Modality } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const modality = req.nextUrl.searchParams.get("modality") as Modality | null;
  if (modality !== "presencial" && modality !== "virtual") {
    return NextResponse.json({ error: "modality inválida" }, { status: 400 });
  }
  try {
    const slots = await getAvailableSlots(modality);
    return NextResponse.json({ slots });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
