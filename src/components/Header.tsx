import Link from "next/link";
import Image from "next/image";

export function Header({ user }: { user: { full_name?: string } | null }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-nda-primary/10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/nda-monogram-blue.png" alt="NDA Asesores" width={64} height={26} className="h-7 w-auto" priority />
          <span className="text-nda-primary font-bold">Prode</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/jugar" className="text-nda-dark hover:text-nda-primary">Jugar</Link>
              <Link href="/ranking" className="text-nda-dark hover:text-nda-primary">Ranking</Link>
              <Link href="/perfil" className="text-nda-dark hover:text-nda-primary">Perfil</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-nda-dark hover:text-nda-primary">Ingresar</Link>
              <Link href="/registro" className="btn-primary !py-2 !px-4 text-sm">Jugar gratis</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
