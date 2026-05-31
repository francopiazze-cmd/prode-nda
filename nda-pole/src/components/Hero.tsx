import { site } from "@/lib/config";

// Hero mobile-first. La foto va en /public/fotos/hero.jpg (ver fotos/README).
// Si todavía no hay foto, se ve un degradado pastel elegante igual.
export default function Hero() {
  const instaUrl = `https://instagram.com/${site.instagram}`;
  return (
    <header className="animate-fade-up">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">
          {site.tagline}
        </span>
        <a
          href={instaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-inkSoft underline-offset-4 hover:underline"
        >
          @{site.instagram}
        </a>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-xl2 shadow-soft">
        {/* Imagen de fondo con fallback a degradado pastel */}
        <div
          className="aspect-[4/5] w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(74,65,58,0) 35%, rgba(74,65,58,0.55) 100%), url('/fotos/hero.jpg')",
            backgroundColor: "#cdbfa9",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h1 className="font-display text-4xl leading-none text-cream drop-shadow">
            {site.name}
          </h1>
        </div>
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-inkSoft">
        {site.intro}
      </p>

      <a href="#reservar" className="btn-primary mt-5 w-full">
        Programá tu clase
      </a>
    </header>
  );
}
