import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runScoring } from "@/lib/score-runner";

const ADMIN_EMAILS = [
  "francopiazze@gmail.com",
  "capraromauro@hotmail.com",
];

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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
