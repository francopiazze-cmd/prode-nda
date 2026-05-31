// Datos editables del sitio. Cambiá estos valores por los reales.
export const site = {
  // Nombre que se ve en el hero y en los eventos del calendario.
  name: "Nadia",
  tagline: "Pole Dance & Movimiento",
  // Bajada corta debajo del nombre.
  intro:
    "Clases personalizadas de pole dance. Elegí modalidad, mirá mi disponibilidad y reservá tu lugar en segundos.",
  // Instagram (sin @). Se usa para el link del header.
  instagram: "tu_instagram",
  // Zona horaria para mostrar y agendar los turnos.
  timezone: "America/Argentina/Buenos_Aires",
  // Duración por defecto de la clase, en minutos (la dueña puede cambiarla por turno).
  defaultDurationMin: 60,
} as const;

export const modalities = {
  presencial: {
    key: "presencial" as const,
    label: "Presencial",
    desc: "En el estudio, una a una o en grupo.",
    emoji: "💃",
  },
  virtual: {
    key: "virtual" as const,
    label: "Virtual",
    desc: "Clase online por videollamada, desde donde estés.",
    emoji: "📱",
  },
};

export type ModalityKey = keyof typeof modalities;
