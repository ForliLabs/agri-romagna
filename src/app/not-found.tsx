import Link from "next/link";
import { Home, LayoutDashboard, MapPinned, Search } from "lucide-react";

const suggestedLinks = [
  {
    label: "Dashboard",
    description: "Panoramica della tua azienda agricola",
    href: "/dashboard",
    Icon: LayoutDashboard,
  },
  {
    label: "Appezzamenti",
    description: "Gestisci campi, colture e NDVI",
    href: "/dashboard/fields",
    Icon: MapPinned,
  },
  {
    label: "Home",
    description: "Torna alla pagina principale",
    href: "/",
    Icon: Home,
  },
];

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center"
    >
      <div className="w-full max-w-lg">
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Search className="h-8 w-8" aria-hidden="true" />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Errore 404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950">
          Pagina non trovata
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-emerald-950/70">
          La risorsa richiesta non esiste o è stata spostata. Controlla
          l&apos;indirizzo nella barra del browser oppure scegli una delle
          destinazioni qui sotto.
        </p>

        {/* Navigation hints */}
        <nav aria-label="Destinazioni suggerite" className="mt-8">
          <ul className="space-y-3 text-left">
            {suggestedLinks.map(({ label, description, href, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-4 rounded-2xl border border-emerald-950/10 bg-white/80 px-4 py-3 shadow-sm transition hover:border-emerald-700/30 hover:bg-emerald-50/60"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-950">
                      {label}
                    </p>
                    <p className="text-xs text-emerald-950/60">{description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-8 text-xs text-emerald-950/45">
          Se il problema persiste, contatta{" "}
          <a
            href="mailto:cooperativa@agriromagna.it"
            className="underline transition hover:text-emerald-700"
          >
            cooperativa@agriromagna.it
          </a>
        </p>
      </div>
    </main>
  );
}
