"use client";

import dynamic from "next/dynamic";

const CarbonBalanceChart = dynamic(
  () => import("@/components/charts").then((m) => ({ default: m.CarbonBalanceChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return (
    <div
      className="flex h-[300px] items-center justify-center rounded-3xl border border-emerald-950/10 bg-white/90 p-6"
      role="status"
      aria-label="Caricamento grafico in corso"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" aria-hidden="true" />
      <span className="sr-only">Caricamento grafico in corso…</span>
    </div>
  );
}

interface CarbonCategoryPoint {
  label: string;
  emissionsKg: number;
  sequestrationKg: number;
  netCarbonKg: number;
}

export function CarbonCharts({ data }: { data: CarbonCategoryPoint[] }) {
  return (
    <section>
      <CarbonBalanceChart data={data} />
    </section>
  );
}
