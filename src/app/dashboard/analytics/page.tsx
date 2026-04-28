"use client";

import { useEffect, useState } from "react";

interface AnalyticsData {
  overview: {
    totalRequests: number;
    errorRate: number;
    responseTime: { p50: number; p95: number; p99: number };
    activeRoutes: number;
    slowQueries: number;
    uptimeSeconds: number;
  };
  routeStats: Array<{
    path: string;
    requests: number;
    avgDurationMs: number;
    errorRate: number;
    p95Ms: number;
  }>;
  featureHeatmap: Array<{
    path: string;
    visits: number;
    avgDurationMs: number;
    lastVisited: string;
    topRoles: string[];
  }>;
  slowQueries: Array<{
    path: string;
    durationMs: number;
    timestamp: number;
  }>;
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Impossibile caricare i dati di analytics."));
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return <div className="py-12 text-center text-emerald-700">Caricamento analytics...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-emerald-950">Analytics & Osservabilità</h1>
        <p className="mt-1 text-sm text-emerald-700">
          Monitoraggio prestazioni, utilizzo funzionalità e salute del sistema.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-emerald-100 bg-white p-5">
          <p className="text-xs font-medium text-emerald-600">Richieste Totali</p>
          <p className="mt-1 text-2xl font-bold text-emerald-950">{data.overview.totalRequests}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white p-5">
          <p className="text-xs font-medium text-emerald-600">Tasso Errori</p>
          <p className="mt-1 text-2xl font-bold text-emerald-950">{data.overview.errorRate}%</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white p-5">
          <p className="text-xs font-medium text-emerald-600">Tempo Risposta (p95)</p>
          <p className="mt-1 text-2xl font-bold text-emerald-950">{data.overview.responseTime.p95}ms</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white p-5">
          <p className="text-xs font-medium text-emerald-600">Uptime</p>
          <p className="mt-1 text-2xl font-bold text-emerald-950">{formatUptime(data.overview.uptimeSeconds)}</p>
        </div>
      </div>

      {/* Memory */}
      <div className="rounded-xl border border-emerald-100 bg-white p-5">
        <h3 className="text-sm font-semibold text-emerald-900">Memoria</h3>
        <div className="mt-3 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-emerald-950">{data.memory.heapUsedMB} MB</p>
            <p className="text-xs text-emerald-600">Heap Usato</p>
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-950">{data.memory.heapTotalMB} MB</p>
            <p className="text-xs text-emerald-600">Heap Totale</p>
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-950">{data.memory.rssMB} MB</p>
            <p className="text-xs text-emerald-600">RSS</p>
          </div>
        </div>
      </div>

      {/* Route Stats */}
      <div className="rounded-xl border border-emerald-100 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-emerald-900">Prestazioni per Route</h3>
        {data.routeStats.length === 0 ? (
          <p className="py-4 text-center text-sm text-emerald-600">Nessun dato ancora disponibile.</p>
        ) : (
          <div className="table-responsive">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-emerald-100 text-left text-xs text-emerald-600">
                  <th className="pb-2">Route</th>
                  <th className="pb-2">Richieste</th>
                  <th className="pb-2">Media</th>
                  <th className="pb-2">p95</th>
                  <th className="pb-2">Errori</th>
                </tr>
              </thead>
              <tbody>
                {data.routeStats.map((route) => (
                  <tr key={route.path} className="border-b border-emerald-50">
                    <td className="py-2 font-mono text-xs">{route.path}</td>
                    <td className="py-2">{route.requests}</td>
                    <td className="py-2">{route.avgDurationMs}ms</td>
                    <td className="py-2">{route.p95Ms}ms</td>
                    <td className="py-2">{Math.round(route.errorRate * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feature Heatmap */}
      <div className="rounded-xl border border-emerald-100 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-emerald-900">Utilizzo Funzionalità</h3>
        {data.featureHeatmap.length === 0 ? (
          <p className="py-4 text-center text-sm text-emerald-600">Inizia a usare la piattaforma per vedere i dati.</p>
        ) : (
          <div className="space-y-2">
            {data.featureHeatmap.map((feature) => {
              const maxVisits = data.featureHeatmap[0]?.visits ?? 1;
              const pct = Math.round((feature.visits / maxVisits) * 100);
              return (
                <div key={feature.path} className="flex items-center gap-3">
                  <span className="w-40 truncate font-mono text-xs text-emerald-800">{feature.path}</span>
                  <div className="h-3 flex-1 rounded-full bg-emerald-50">
                    <div
                      className="h-3 rounded-full bg-emerald-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs text-emerald-700">{feature.visits}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slow Queries */}
      {data.slowQueries.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="mb-3 text-sm font-semibold text-amber-900">⚠️ Query Lente (&gt;500ms)</h3>
          <div className="space-y-1">
            {data.slowQueries.map((q, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs text-amber-800">{q.path}</span>
                <span className="text-amber-700">{q.durationMs}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
