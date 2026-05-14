"use client";

import dynamic from "next/dynamic";

const RainfallChart = dynamic(
  () => import("@/components/charts").then((m) => ({ default: m.RainfallChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const ForecastChart = dynamic(
  () => import("@/components/charts").then((m) => ({ default: m.ForecastChart })),
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

interface RainfallPoint {
  label: string;
  mm: number;
}

interface ForecastPoint {
  day: string;
  maxC: number;
  minC: number;
  rainProbability: number;
}

export function WeatherCharts({
  rainfall,
  forecast,
}: {
  rainfall: RainfallPoint[];
  forecast: ForecastPoint[];
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <RainfallChart data={rainfall} />
      <ForecastChart data={forecast} />
    </section>
  );
}
