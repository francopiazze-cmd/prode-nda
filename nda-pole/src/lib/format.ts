import { site } from "./config";

// Formateo de fechas/horas en español y zona horaria del estudio.

export function formatDateLong(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: site.timezone,
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: site.timezone,
  }).format(new Date(iso));
}

// Clave de día (YYYY-MM-DD) en la zona del estudio, para agrupar turnos.
export function dayKey(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: site.timezone,
  }).format(new Date(iso));
  return parts; // en-CA da YYYY-MM-DD
}

export function formatDayHeading(iso: string): string {
  const s = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: site.timezone,
  }).format(new Date(iso));
  return s.charAt(0).toUpperCase() + s.slice(1);
}
