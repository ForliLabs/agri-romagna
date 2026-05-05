"use client";

import { CarbonBalanceChart } from "@/components/charts";

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
