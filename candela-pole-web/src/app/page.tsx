import { site } from "@/lib/config";
import BookingFlow from "@/components/BookingFlow";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-12 pt-8">
      <Hero />

      <section id="reservar" className="mt-10 scroll-mt-6">
        <h2 className="font-display text-2xl text-ink">Programá tu clase</h2>
        <p className="mt-1 text-sm text-inkSoft">
          Elegí la modalidad y mirá mi disponibilidad.
        </p>
        <div className="mt-5">
          <BookingFlow />
        </div>
      </section>

      <footer className="mt-auto pt-12 text-center text-xs text-inkSoft/70">
        <p>
          {site.name} · {site.tagline}
        </p>
        <p className="mt-1">Hecho con cariño 🤍</p>
      </footer>
    </main>
  );
}
