import { Booking } from "./types";
import { formatDateLong, formatTime } from "./format";
import { site, modalities } from "./config";

// Aviso por email a la dueña cuando entra una reserva nueva (opcional, Resend).
// Si no hay RESEND_API_KEY u OWNER_EMAIL, no hace nada (la reserva igual se guarda).
export async function notifyOwner(booking: Booking): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;
  const from = process.env.NOTIFY_FROM || `Candela Pole <onboarding@resend.dev>`;
  if (!apiKey || !ownerEmail) return;

  const modalidad = modalities[booking.modality].label;
  const cuando = `${formatDateLong(booking.starts_at)} a las ${formatTime(
    booking.starts_at
  )} hs`;

  const html = `
    <div style="font-family:system-ui,sans-serif;color:#4A413A">
      <h2 style="margin:0 0 8px">Nueva reserva — ${modalidad}</h2>
      <p style="margin:0 0 12px">${cuando}</p>
      <table style="border-collapse:collapse">
        <tr><td style="padding:2px 12px 2px 0"><b>Alumna</b></td><td>${booking.student_name}</td></tr>
        <tr><td style="padding:2px 12px 2px 0"><b>Teléfono</b></td><td>${booking.student_phone}</td></tr>
        <tr><td style="padding:2px 12px 2px 0"><b>Email</b></td><td>${booking.student_email}</td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:13px;color:#6B6058">
        Ya quedó en tu calendario suscrito de ${site.name}.
      </p>
    </div>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: ownerEmail,
        subject: `Reserva ${modalidad}: ${booking.student_name} — ${cuando}`,
        html,
      }),
    });
  } catch {
    // No bloqueamos la reserva si falla el aviso.
  }
}
