import { site } from "./config";

// Generación de archivos .ics y links "Agregar a Google Calendar".

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

// Formato UTC para iCalendar: 20260601T180000Z
export function toICSDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export interface CalEvent {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  url?: string;
  start: string; // ISO
  durationMin: number;
}

function endIso(start: string, durationMin: number): string {
  return new Date(new Date(start).getTime() + durationMin * 60000).toISOString();
}

export function buildVEvent(ev: CalEvent): string {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${ev.uid}`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${toICSDate(ev.start)}`,
    `DTEND:${toICSDate(endIso(ev.start, ev.durationMin))}`,
    `SUMMARY:${escapeICS(ev.title)}`,
  ];
  if (ev.description) lines.push(`DESCRIPTION:${escapeICS(ev.description)}`);
  if (ev.location) lines.push(`LOCATION:${escapeICS(ev.location)}`);
  if (ev.url) lines.push(`URL:${escapeICS(ev.url)}`);
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

export function buildICS(events: CalEvent[], calName = site.name): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NDA Pole//Reservas//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICS(calName)}`,
    `X-WR-TIMEZONE:${site.timezone}`,
    ...events.map(buildVEvent),
    "END:VCALENDAR",
  ].join("\r\n");
}

// Link "Agregar a Google Calendar" (abre el evento ya pre-cargado).
export function googleCalendarLink(ev: CalEvent): string {
  const fmt = (iso: string) => toICSDate(iso).replace(/Z$/, "Z");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates: `${fmt(ev.start)}/${fmt(endIso(ev.start, ev.durationMin))}`,
  });
  if (ev.description) params.set("details", ev.description);
  if (ev.location) params.set("location", ev.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
