import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const profile = user
    ? (await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()).data
    : null;

  return (
    <>
      <Header user={profile} />

      {/* HERO */}
      <section className="hero-gradient text-white overflow-hidden relative">
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-16 sm:pt-20 sm:pb-24 relative z-10 flex flex-col sm:flex-row items-center gap-8">
          {/* Texto hero */}
          <div className="flex-1 text-center sm:text-left">
            <span className="chip bg-nda-accent/20 text-nda-accent border border-nda-accent/40">
              <DotIcon /> Mundial 2026 · 11 jun → 19 jul
            </span>
            <h1 className="mt-5 text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight">
              Nosotros cubrimos lo inesperado.<br />
              <span className="text-nda-accent">Vos predecilo.</span>
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-white/85 max-w-xl mx-auto sm:mx-0">
              104 partidos, 48 selecciones, un solo ganador. Jugá gratis por una Smart TV — cortesía de NDA Asesores.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
              <Link href="/registro" className="btn-accent text-base">Jugar gratis</Link>
              <Link href="/login" className="btn-ghost-light text-base">Ya tengo cuenta</Link>
            </div>
            <p className="mt-3 text-xs text-white/60">Tarda menos de 1 minuto registrarse · 100% gratis</p>
          </div>
          {/* Pato hero — solo desktop */}
          <div className="hidden sm:flex shrink-0 h-[420px] overflow-hidden items-end">
            <Image
              src="/pato-pie.png"
              alt="Mascota NDA Prode"
              width={280}
              height={420}
              className="object-contain object-bottom h-full w-auto"
              priority
            />
          </div>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-12">
        {/* CÓMO SUMÁS PUNTOS */}
        <section>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-nda-dark mb-2">¿Cómo se juega?</h2>
          <p className="text-center text-nda-dark/70 mb-8">Más certero, más puntos. Más amigos, más ventaja.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <FeatureCard
              icon={<BallIcon />}
              title="Acertá y sumá"
              desc="5 pts por resultado exacto · 3 pts por ganador y diferencia · 1 pt por ganador. En eliminatorias, todo x2."
            />
            <FeatureCard
              icon={<GroupIcon />}
              title="Invitá y ganá más"
              desc="+2 pts por cada amigo que juegue (hasta 10 = 20 pts). Si invitás más, vas por el premio Embajador."
            />
            <FeatureCard
              icon={<ChartIcon />}
              title="Tabla en vivo"
              desc="Mirá tu ranking actualizarse partido a partido. Competí contra todo el país."
            />
          </div>
        </section>

        {/* BONUS ASEGURADO NDA */}
        <section className="card-highlight">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-nda-accent/20 grid place-items-center text-nda-primary">
              <ShieldIcon />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-nda-primary">Bonus para clientes</p>
              <h3 className="font-extrabold text-xl text-nda-dark mt-1">Clientes NDA: 20 puntos de ventaja desde el minuto cero.</h3>
              <p className="text-sm text-nda-dark/80 mt-2">
                Si tenés póliza con nosotros, cargá tu patente al registrarte. La validamos en 48 hs hábiles y arrancás el Mundial
                con <strong>20 puntos en el bolsillo</strong> — equivalente a clavar 4 resultados exactos antes de que ruede la pelota.
              </p>
            </div>
          </div>
        </section>

        {/* PREMIOS */}
        <section>
          <div className="flex items-center justify-center gap-6 mb-8">
            <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-nda-dark">Los premios</h2>
            {/* Pato festejo — solo desktop */}
            <div className="hidden sm:block shrink-0">
              <Image
                src="/pato-festejo.png"
                alt="Mascota NDA festejando"
                width={120}
                height={200}
                className="object-contain h-[200px] w-auto"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <PrizeCard place="1°" highlight icon={<TvIcon />} title="Smart TV 55″" desc="Modelo a confirmar" />
            <PrizeCard place="2°" icon={<CoffeeIcon />} title="Cafetera Nespresso" desc="Modelo a confirmar" />
            <PrizeCard place="3°" icon={<DishIcon />} title="Gift card cena" desc="Kansas Nordelta" />
            <PrizeCard place="Embajador" icon={<MegaphoneIcon />} title="Premio aparte" desc="Premio aparte para quien más amigos sume al prode. Si convertís tu grupo de WhatsApp en jugadores, ganás aunque no aciertes un solo partido." />
          </div>
        </section>

        {/* ¿POR QUÉ EN NDA ARMAMOS ESTO? */}
        <section className="card !p-8 text-center">
          <h2 className="font-extrabold text-2xl sm:text-3xl text-nda-dark mb-4">¿Por qué en NDA armamos esto?</h2>
          <p className="text-nda-dark/80 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
            Porque estar cuando pasa lo inesperado es nuestro trabajo todos los días. Durante el Mundial, lo hacemos un juego.
          </p>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="card !p-6">
          <h2 className="font-extrabold text-xl mb-4 text-nda-primary">Paso a paso</h2>
          <ol className="space-y-3">
            <StepItem n={1}>Te registrás con tu mail o Google (1 minuto).</StepItem>
            <StepItem n={2}>Cargás tu pronóstico antes de cada partido (cierra 5 min antes del kickoff).</StepItem>
            <StepItem n={3}>Compartís tu link de invitación por WhatsApp y sumás puntos por cada amigo que juega.</StepItem>
            <StepItem n={4}>Llegás al 19 de julio con más puntos que todos. La TV es tuya.</StepItem>
          </ol>
        </section>

        {/* CTA FINAL */}
        <section className="text-center py-4">
          <Link href="/registro" className="btn-accent text-base">Quiero jugar</Link>
          <p className="mt-3 text-xs text-nda-dark/60">Concurso de habilidad organizado por NDA Asesores.</p>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-nda-dark text-white/80 mt-8">
        <div className="max-w-3xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <Image src="/nda-logo.png" alt="NDA Asesores de Seguros" width={180} height={98} className="h-20 w-auto" />
            <p className="mt-3 text-xs leading-relaxed">
              Brokers de seguros en Nordelta. Cubrimos lo inesperado para que vos juegues tranquilo.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Contacto</p>
            <p className="text-xs">Agustín M. García 5971</p>
            <p className="text-xs">Delta Point, Nordelta</p>
            <p className="text-xs mt-2">📞 11 6000 1754</p>
            <p className="text-xs">✉ info@ndasesores.com.ar</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Prode NDA</p>
            <ul className="text-xs space-y-1">
              <li><Link href="/legal/bases" className="hover:text-nda-accent">Bases y condiciones</Link></li>
              <li><Link href="/legal/privacidad" className="hover:text-nda-accent">Política de privacidad</Link></li>
              <li><a href="https://www.ndasesores.com.ar" className="hover:text-nda-accent" target="_blank" rel="noreferrer">Sitio web NDA ↗</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-3xl mx-auto px-4 py-4 text-xs text-white/50 flex flex-col sm:flex-row justify-between gap-2">
            <p>© {new Date().getFullYear()} NDA Asesores. Todos los derechos reservados.</p>
            <p>Concurso de habilidad · Sin compra obligatoria.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ========== SUBCOMPONENTES ========== */

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card group hover:shadow-md transition">
      <div className="w-10 h-10 rounded-lg bg-nda-primary/10 text-nda-primary grid place-items-center mb-3 group-hover:bg-nda-accent group-hover:text-nda-dark transition">
        {icon}
      </div>
      <h3 className="font-bold text-nda-dark mb-1">{title}</h3>
      <p className="text-sm text-nda-dark/75">{desc}</p>
    </div>
  );
}

function PrizeCard({
  place,
  title,
  desc,
  icon,
  highlight = false
}: {
  place: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`card flex items-center gap-4 ${highlight ? "ring-2 ring-nda-accent" : ""}`}>
      <div className={`shrink-0 w-14 h-14 rounded-xl grid place-items-center ${
        highlight ? "bg-nda-accent text-nda-dark" : "bg-nda-soft text-nda-primary"
      }`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-nda-primary">{place}</p>
        <p className="font-bold text-nda-dark leading-tight">{title}</p>
        <p className="text-xs text-nda-dark/60">{desc}</p>
      </div>
    </div>
  );
}

function StepItem({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="shrink-0 w-7 h-7 rounded-full bg-nda-accent text-nda-dark text-sm font-bold grid place-items-center">{n}</span>
      <span className="text-nda-dark/90 pt-0.5">{children}</span>
    </li>
  );
}

/* ========== ICONOS SVG ========== */

function DotIcon() {
  return <span className="inline-block w-2 h-2 rounded-full bg-nda-accent animate-pulse" />;
}

const iconProps = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function BallIcon() {
  return (
    <svg {...iconProps}><circle cx="12" cy="12" r="10" /><path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4" /></svg>
  );
}
function GroupIcon() {
  return (
    <svg {...iconProps}><path d="M17 21v-2a4 4 0 0 0-3-3.87" /><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /></svg>
  );
}
function ChartIcon() {
  return (
    <svg {...iconProps}><path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-5" /></svg>
  );
}
function ShieldIcon() {
  return (
    <svg {...iconProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
  );
}
function TvIcon() {
  return (
    <svg {...iconProps}><rect x="2" y="5" width="20" height="13" rx="2" /><path d="M8 21h8M12 18v3" /></svg>
  );
}
function CoffeeIcon() {
  return (
    <svg {...iconProps}><path d="M17 8h1a4 4 0 0 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" /><path d="M6 2v3M10 2v3M14 2v3" /></svg>
  );
}
function DishIcon() {
  return (
    <svg {...iconProps}><path d="M5 11h14a7 7 0 0 1-14 0z" /><path d="M3 11h18" /><path d="M12 7V3M10 5h4" /></svg>
  );
}
function MegaphoneIcon() {
  return (
    <svg {...iconProps}><path d="M3 11l18-8v18l-18-8z" /><path d="M11 11v6" /><path d="M3 11h2v4H3z" /></svg>
  );
}
