import Link from "next/link";

interface FooterProps {
  brand: string;
  tagline?: string;
}

export function Footer({ brand, tagline }: FooterProps) {
  return (
    <footer className="mt-auto border-t border-emerald-950/10 bg-[#1d3a28] text-emerald-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-bold">{brand}</p>
            {tagline && <p className="mt-1 text-sm text-emerald-100/80">{tagline}</p>}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-emerald-100/80">
            <Link href="/" className="rounded-md px-1 transition hover:text-white focus-visible:text-white">Piattaforma</Link>
            <Link href="/dashboard" className="rounded-md px-1 transition hover:text-white focus-visible:text-white">Dashboard</Link>
            <a href="mailto:cooperativa@agriromagna.it" className="rounded-md px-1 transition hover:text-white focus-visible:text-white">Contatti</a>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-emerald-100/65">
          © {new Date().getFullYear()} {brand}. Filiera digitale coltivata in Romagna.
        </p>
      </div>
    </footer>
  );
}
