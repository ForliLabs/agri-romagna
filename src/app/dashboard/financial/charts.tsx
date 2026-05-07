"use client";

import dynamic from "next/dynamic";

const CashFlowChart = dynamic(
  () => import("@/components/charts").then((m) => ({ default: m.CashFlowChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const CostBreakdownChart = dynamic(
  () => import("@/components/charts").then((m) => ({ default: m.CostBreakdownChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-3xl border border-emerald-950/10 bg-white/90 p-6">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
    </div>
  );
}

interface CashFlowItem {
  month: string;
  inflows: number;
  outflows: number;
  netCashFlow: number;
  cumulativeCash: number;
}

interface CostItem {
  label: string;
  totalAmount: number;
  sharePercent: number;
}

export function FinancialCharts({
  cashFlow,
  costBreakdown,
}: {
  cashFlow: CashFlowItem[];
  costBreakdown: CostItem[];
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <CashFlowChart data={cashFlow} />
      <CostBreakdownChart data={costBreakdown} />
    </section>
  );
}
