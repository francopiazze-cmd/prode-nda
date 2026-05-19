import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prode NDA — Mundial 2026",
  description:
    "Jugá al Prode del Mundial 2026 con NDA Asesores. Ganá una Smart TV y otros premios. Invitá amigos y sumá puntos extra.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://prode.ndasesores.com.ar"
  ),
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png"
  },
  openGraph: {
    title: "Prode NDA — Mundial 2026",
    description:
      "Jugá gratis y ganá una Smart TV. Invitá amigos y sumá puntos extra. Cortesía de NDA Asesores.",
    type: "website",
    locale: "es_AR"
    // La imagen la genera dinámicamente src/app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "Prode NDA — Mundial 2026",
    description:
      "Jugá gratis y ganá una Smart TV. Invitá amigos y sumá puntos extra."
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#182aa4"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body className="min-h-screen bg-nda-soft">{children}</body>
    </html>
  );
}
