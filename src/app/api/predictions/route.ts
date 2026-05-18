import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isPredictionLocked } from "@/lib/scoring";

const PredictionInput = z.object({
  match_id: z.number().int().positive(),
  home_score: z.number().int().min(0).max(20),
  away_score: z.number().int().min(0).max(20)
});

/**
 * Endpoint alternativo (server-side) para crear/actualizar pronósticos.
 * El cliente puede usar Supabase directamente, pero este endpoint:
 *  1) revalida que el partido no esté cerrado en el server (anti-trampa)
 *  2) deja un único punto para auditar/loggear si hace falta más adelante
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = PredictionInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: match } = await supabase
    .from("matches")
    .select("id, utc_kickoff, status")
    .eq("id", parsed.data.match_id)
    .single();

  if (!match) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  if (match.status !== "SCHEDULED" || isPredictionLocked(match.utc_kickoff)) {
    return NextResponse.json({ error: "Pronóstico cerrado para este partido" }, { status: 400 });
  }

  const { error } = await supabase.from("predictions").upsert(
    {
      user_id: user.id,
      match_id: parsed.data.match_id,
      home_score: parsed.data.home_score,
      away_score: parsed.data.away_score,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,match_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
