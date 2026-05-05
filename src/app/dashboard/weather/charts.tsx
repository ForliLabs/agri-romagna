"use client";

import { RainfallChart, ForecastChart } from "@/components/charts";

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
