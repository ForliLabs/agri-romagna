import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-lg rounded-3xl border border-emerald-950/10 bg-white/90 px-8 py-12 text-center shadow-sm shadow-emerald-950/5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Search className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-emerald-950">
          Pagina non trovata
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-emerald-950/65">
          Il modulo o la risorsa richiesta non esiste oppure è stata spostata.
          Verifica l&apos;indirizzo o torna alla panoramica.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Torna alla dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
