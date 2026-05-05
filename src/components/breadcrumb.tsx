"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  fields: "Campi",
  weather: "Meteo & rischi",
  harvest: "Raccolta",
  logistics: "Logistica",
  traceability: "Tracciabilità",
  marketplace: "Vendita diretta",
  cooperative: "Cooperativa",
  compliance: "Conformità",
  workforce: "Forza lavoro",
  equipment: "Attrezzature",
  communication: "Comunicazione",
  mobile: "Mobile campo",
  analytics: "Analytics",
  insights: "Insight Engine",
  advisor: "Consulente AI",
  "anomaly-detection": "Anomalie & previsioni",
  intelligence: "Intelligenza",
  "yield-prediction": "Previsioni resa",
  benchmarking: "Benchmarking",
  satellite: "Satellitare",
  carbon: "Carbonio",
  esg: "ESG & Impatto",
  water: "Gestione idrica",
  "pest-warning": "Allerta fitosanitaria",
  insurance: "Assicurazione",
  "soil-health": "Salute suolo",
  regulatory: "Radar normativo",
  "spray-optimizer": "Spray optimizer",
  iot: "Sensori IoT",
  "supply-chain": "Filiera",
  governance: "Governance",
  interoperability: "Interoperabilità",
  "compliance-chain": "Catena conformità",
  "data-marketplace": "Data Marketplace",
  "knowledge-graph": "Knowledge Graph",
  federation: "Federazione",
  rbac: "Accessi & Ruoli",
  commercial: "Commerciale",
  simulator: "Simulatore",
  "test-harness": "Test & CI/CD",
  moonshots: "Moonshots",
  financial: "Finanza",
};

function getLabel(segment: string): string {
  return segmentLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => ({
    label: getLabel(segment),
    href: "/" + segments.slice(0, index + 1).join("/"),
    isLast: index === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-emerald-950/60">
        <li className="flex items-center gap-1.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:text-emerald-700"
            aria-label="Home dashboard"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </li>
        {crumbs.slice(1).map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-emerald-950/30" aria-hidden="true" />
            {crumb.isLast ? (
              <span className="font-medium text-emerald-950" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="rounded-md px-1 py-0.5 transition-colors hover:text-emerald-700"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
