"use client";

import { CashFlowChart, CostBreakdownChart } from "@/components/charts";

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
