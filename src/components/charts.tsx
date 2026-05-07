"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
  /** Data rows for an sr-only accessible table behind the chart */
  accessibleData?: { headers: string[]; rows: (string | number)[][] };
}

export function ChartContainer({ title, subtitle, children, height = 300, accessibleData }: ChartContainerProps) {
  return (
    <div className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5 dark:border-emerald-50/10 dark:bg-[#162b1e]/90">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-emerald-950/65 dark:text-emerald-100/65">{subtitle}</p>}
      </div>
      <div style={{ width: "100%", height }} role="img" aria-label={title}>
        {children}
      </div>
      {accessibleData && (
        <table className="sr-only">
          <caption>{title}</caption>
          <thead>
            <tr>
              {accessibleData.headers.map((h) => (
                <th key={h} scope="col">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accessibleData.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{typeof cell === "number" ? cell.toLocaleString("it-IT") : cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const chartColors = {
  emerald: "#059669",
  emeraldLight: "#34d399",
  amber: "#d97706",
  rose: "#e11d48",
  sky: "#0284c7",
  lime: "#65a30d",
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-emerald-950/10 bg-white px-4 py-3 text-sm shadow-lg dark:border-emerald-50/10 dark:bg-[#162b1e]">
      <p className="font-semibold text-emerald-950 dark:text-emerald-50">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="mt-1 text-emerald-950/75 dark:text-emerald-100/75">
          <span style={{ color: entry.color }} className="mr-2 font-medium">●</span>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString("it-IT") : entry.value}
        </p>
      ))}
    </div>
  );
}

// --- Financial Charts ---

interface CashFlowDataPoint {
  month: string;
  inflows: number;
  outflows: number;
  netCashFlow: number;
  cumulativeCash: number;
}

export function CashFlowChart({ data }: { data: CashFlowDataPoint[] }) {
  return (
    <ChartContainer
      title="Andamento di cassa"
      subtitle="Entrate, uscite e saldo cumulato nei prossimi 6 mesi"
      accessibleData={{
        headers: ["Mese", "Entrate (€)", "Uscite (€)", "Flusso netto (€)", "Cassa cumulata (€)"],
        rows: data.map((d) => [d.month, d.inflows, d.outflows, d.netCashFlow, d.cumulativeCash]),
      }}
    >
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d6ddcf" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="inflows" name="Entrate" fill={chartColors.emerald} radius={[4, 4, 0, 0]} />
          <Bar dataKey="outflows" name="Uscite" fill={chartColors.amber} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface CostBreakdownDataPoint {
  label: string;
  totalAmount: number;
  sharePercent: number;
}

export function CostBreakdownChart({ data }: { data: CostBreakdownDataPoint[] }) {
  return (
    <ChartContainer
      title="Distribuzione costi"
      subtitle="Categorie di spesa cooperativa"
      accessibleData={{
        headers: ["Categoria", "Importo (€)", "Quota (%)"],
        rows: data.map((d) => [d.label, d.totalAmount, d.sharePercent]),
      }}
    >
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d6ddcf" />
          <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} width={75} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="totalAmount" name="Importo" fill={chartColors.emerald} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// --- IoT Charts ---

interface SensorHistoryPoint {
  timestamp: string;
  value: number;
  label: string;
}

export function SensorTrendChart({ data, sensorName, unit }: { data: SensorHistoryPoint[]; sensorName: string; unit: string }) {
  return (
    <ChartContainer
      title={`Trend ${sensorName}`}
      subtitle={`Ultime 24 ore (${unit})`}
      height={250}
      accessibleData={{
        headers: ["Ora", `${sensorName} (${unit})`],
        rows: data.map((d) => [d.label, d.value]),
      }}
    >
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d6ddcf" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            name={sensorName}
            stroke={chartColors.emerald}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// --- Carbon Charts ---

interface CarbonCategoryPoint {
  label: string;
  emissionsKg: number;
  sequestrationKg: number;
  netCarbonKg: number;
}

export function CarbonBalanceChart({ data }: { data: CarbonCategoryPoint[] }) {
  return (
    <ChartContainer
      title="Bilancio carbonico per categoria"
      subtitle="Emissioni vs sequestro (kg CO₂e)"
      accessibleData={{
        headers: ["Categoria", "Emissioni (kg)", "Sequestro (kg)", "Netto (kg)"],
        rows: data.map((d) => [d.label, d.emissionsKg, d.sequestrationKg, d.netCarbonKg]),
      }}
    >
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d6ddcf" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="emissionsKg" name="Emissioni" fill={chartColors.amber} radius={[4, 4, 0, 0]} />
          <Bar dataKey="sequestrationKg" name="Sequestro" fill={chartColors.emerald} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// --- Weather Charts ---

interface RainfallPoint {
  label: string;
  mm: number;
}

export function RainfallChart({ data }: { data: RainfallPoint[] }) {
  return (
    <ChartContainer
      title="Storico piogge"
      subtitle="Andamento precipitazioni nelle ultime settimane (mm)"
      accessibleData={{
        headers: ["Periodo", "Pioggia (mm)"],
        rows: data.map((d) => [d.label, d.mm]),
      }}
    >
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d6ddcf" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="mm" name="Pioggia (mm)" fill={chartColors.sky} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface ForecastPoint {
  day: string;
  maxC: number;
  minC: number;
  rainProbability: number;
}

export function ForecastChart({ data }: { data: ForecastPoint[] }) {
  return (
    <ChartContainer
      title="Temperature 7 giorni"
      subtitle="Minime, massime e probabilità pioggia"
      accessibleData={{
        headers: ["Giorno", "Max °C", "Min °C", "Probabilità pioggia (%)"],
        rows: data.map((d) => [d.day, d.maxC, d.minC, d.rainProbability]),
      }}
    >
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d6ddcf" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="maxC" name="Max °C" stroke={chartColors.rose} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="minC" name="Min °C" stroke={chartColors.sky} strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export { chartColors };
