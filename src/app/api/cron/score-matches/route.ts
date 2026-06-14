import { NextResponse, type NextRequest } from "next/server";
import { runScoring } from "@/lib/score-runner";

/**
 * Cron: detecta partidos terminados, puntúa sus pronósticos y refresca el
 * leaderboard. La lógica vive en @/lib/score-runner (compartida con el botón
 * de admin "Actualizar resultados ahora").
 */
export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await runScoring();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
