import Link from "next/link";
import { Mail, MapPin, Phone, Sprout } from "lucide-react";

interface FooterProps {
  brand: string;
  tagline?: string;
}

const navigationLinks = [
  { label: "Piattaforma", href: "/" },
  { label: "Funzionalità", href: "/#funzionalita" },
  { label: "Prezzi", href: "/#prezzi" },
  { label: "Dashboard", href: "/dashboard" },
];

const supportLinks = [
  { label: "Contatti", href: "mailto:cooperativa@agriromagna.it" },
  { label: "Onboarding", href: "/onboarding" },
  { label: "Dashboard operativa", href: "/dashboard" },
  { label: "Tracciabilità pubblica", href: "/traceability/lot-sangiovese-2026-a" },
];

const legalLinks = [
  { label: "Privacy e dati", href: "mailto:cooperativa@agriromagna.it?subject=Richiesta%20privacy" },
  { label: "Condizioni di servizio", href: "mailto:cooperativa@agriromagna.it?subject=Richiesta%20termini%20di%20servizio" },
  { label: "Cookie e consensi", href: "mailto:cooperativa@agriromagna.it?subject=Richiesta%20informativa%20cookie" },
];

export function Footer({ brand, tagline }: FooterProps) {
  return (
    <footer role="contentinfo" aria-label="Footer del sito" className="mt-auto border-t border-emerald-950/10 bg-[#1d3a28] text-emerald-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Top grid: brand + nav columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-lime-400" aria-hidden="true" />
              <p className="text-lg font-bold">{brand}</p>
            </div>
            {tagline && (
              <p className="mt-2 max-w-xs text-sm leading-6 text-emerald-100/70">
                {tagline}
              </p>
            )}
            <div className="mt-4 space-y-2 text-sm text-emerald-100/65">
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Bertinoro, Forlì-Cesena (FC)
              </p>
              <a
                href="mailto:cooperativa@agriromagna.it"
                className="flex items-center gap-2 transition hover:text-white"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                cooperativa@agriromagna.it
              </a>
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                +39 0543 000 000
              </p>
            </div>
          </div>

          {/* Navigation column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              Navigazione
            </h3>
            <ul className="mt-4 space-y-2.5">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-emerald-100/75 transition hover:text-white focus-visible:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              Supporto
            </h3>
            <ul className="mt-4 space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("mailto:") ? (
                    <a
                      href={link.href}
                      className="text-sm text-emerald-100/75 transition hover:text-white focus-visible:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-emerald-100/75 transition hover:text-white focus-visible:text-white"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              Legale
            </h3>
            <ul className="mt-4 space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("mailto:") ? (
                    <a
                      href={link.href}
                      className="text-sm text-emerald-100/75 transition hover:text-white focus-visible:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-emerald-100/75 transition hover:text-white focus-visible:text-white"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider + copyright */}
        <div className="mt-10 border-t border-emerald-100/15 pt-6 text-center text-xs text-emerald-100/55">
          <p>
            © {new Date().getFullYear()} {brand}. Filiera digitale coltivata in
            Romagna.
          </p>
        </div>
      </div>
    </footer>
  );
}
