"use client";

import { SensorTrendChart } from "@/components/charts";

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
