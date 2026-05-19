import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Prode NDA — Mundial 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://prode.ndasesores.com.ar";

  const [patoSrc, logoSrc] = await Promise.all([
    fetch(`${appUrl}/pato-pelota.png`).then((r) => r.arrayBuffer()),
    fetch(`${appUrl}/nda-monogram-light.png`).then((r) => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #182aa4 0%, #0a1452 60%, #182aa4 100%)",
          position: "relative",
        }}
      >
        {/* Texto a la izquierda */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 50px",
          }}
        >
          {/* Logo NDA */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc as unknown as string}
            alt="NDA"
            width={180}
            height={80}
            style={{ marginBottom: 32 }}
          />

          {/* Chip Mundial */}
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              backgroundColor: "rgba(74, 234, 234, 0.2)",
              border: "2px solid rgba(74, 234, 234, 0.5)",
              borderRadius: 999,
              padding: "8px 18px",
              color: "#4aeaea",
              fontSize: 22,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            ⚽ Mundial 2026
          </div>

          {/* Título */}
          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              color: "white",
              lineHeight: 1.05,
              marginBottom: 18,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Jugá al Prode.</span>
            <span style={{ color: "#4aeaea" }}>Ganá una Smart TV.</span>
          </div>

          {/* Subtítulo */}
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.85)",
              marginBottom: 28,
              display: "flex",
            }}
          >
            104 partidos. 48 selecciones. Un solo ganador.
          </div>

          {/* CTA URL */}
          <div
            style={{
              fontSize: 24,
              color: "white",
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "12px 22px",
              alignSelf: "flex-start",
              display: "flex",
            }}
          >
            prode.ndasesores.com.ar
          </div>
        </div>

        {/* Pato a la derecha */}
        <div
          style={{
            width: 480,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 20,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={patoSrc as unknown as string}
            alt="Pato Prode"
            width={460}
            height={580}
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
