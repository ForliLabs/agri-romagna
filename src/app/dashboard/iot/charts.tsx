"use client";

import dynamic from "next/dynamic";

const SensorTrendChart = dynamic(
  () => import("@/components/charts").then((m) => ({ default: m.SensorTrendChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return (
    <div className="flex h-[250px] items-center justify-center rounded-3xl border border-emerald-950/10 bg-white/90 p-6">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
    </div>
  );
}

interface SensorHistoryPoint {
  timestamp: string;
  value: number;
  label: string;
}

export function IoTCharts({
  series,
}: {
  series: { sensorName: string; unit: string; data: SensorHistoryPoint[] }[];
}) {
  if (series.length === 0) return null;
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      {series.map((s) => (
        <SensorTrendChart key={s.sensorName} data={s.data} sensorName={s.sensorName} unit={s.unit} />
      ))}
    </section>
  );
}
