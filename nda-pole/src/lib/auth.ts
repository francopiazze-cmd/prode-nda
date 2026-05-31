import { NextRequest } from "next/server";

// Chequeo simple de admin por contraseña (header Authorization: Bearer <password>).
// Para un sitio chico de una sola dueña alcanza; usar SIEMPRE sobre HTTPS
// y una contraseña fuerte en ADMIN_PASSWORD.
export function isAdmin(req: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const header = req.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  return token.length > 0 && token === expected;
}
