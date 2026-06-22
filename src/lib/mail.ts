import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.RESEND_FROM_EMAIL || "prode@ndasesores.com.ar";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://prode.ndasesores.com.ar";

export async function sendWelcomeEmail(to: string, name: string, referralCode: string) {
  const link = `${appUrl}/r/${referralCode}`;
  return resend.emails.send({
    from,
    to,
    subject: "Bienvenido al Prode NDA del Mundial 2026",
    html: `
      <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0a1452">
        <h1 style="color:#182aa4">Hola ${escapeHtml(name)}, bienvenido al Prode NDA</h1>
        <p>Ya estás dentro. Cargá tus pronósticos antes del primer partido del Mundial 2026 y empezá a sumar puntos.</p>
        <p>Tu link de invitación es:</p>
        <p style="background:#F5F7FB;padding:12px;border-radius:8px;word-break:break-all">
          <a href="${link}" style="color:#182aa4">${link}</a>
        </p>
        <p>Cada amigo que se registre con tu link y juegue al menos un pronóstico te suma <strong>+2 puntos</strong> (hasta 10 amigos = máx. 20 pts al ranking principal). Si invitás más, competís por el <strong>premio Embajador</strong>.</p>
        <p>¿Sos cliente de NDA? Si ya tenés una póliza con nosotros y cargaste tu patente al registrarte, te sumamos <strong>+20 puntos</strong> de ventaja una vez validada.</p>
        <p>Premios: <strong>1°</strong> Smart TV 55" · <strong>2°</strong> Camiseta de la Selección Argentina · <strong>3°</strong> Gift card cena en Kansas Nordelta · <strong>Embajador</strong> (más referidos).</p>
        <p style="margin-top:32px;font-size:13px;color:#888">
          NDA Asesores · prode.ndasesores.com.ar<br>
          Si no querés recibir más mails, podés darte de baja en tu perfil.
        </p>
      </div>
    `
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    const m: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return m[c];
  });
}
