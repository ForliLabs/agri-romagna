"use client";

import { useState } from "react";
import Link from "next/link";
import {
  fieldBoundaries,
  getLatestNDVIByField,
  ndviReadings,
  ndviToColor,
  classifyNDVI,
  healthStatusLabel,
  type FieldBoundary,
  type NDVIReading,
} from "@/lib/satellite-data";
import { fields } from "@/lib/data";

const latestReadings = getLatestNDVIByField(ndviReadings);

function normalizeBoundaries() {
  const points = fieldBoundaries.flatMap((boundary) => boundary.coordinates);
  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  return fieldBoundaries.map((boundary) => ({
    ...boundary,
    points: boundary.coordinates
      .map(([lng, lat]) => {
        const x = ((lng - minLng) / (maxLng - minLng || 1)) * 100;
        const y = 100 - ((lat - minLat) / (maxLat - minLat || 1)) * 100;
        return `${x},${y}`;
      })
      .join(" "),
    centroid: {
      x:
        boundary.coordinates.reduce((s, [lng]) => s + lng, 0) /
        boundary.coordinates.length,
      y:
        boundary.coordinates.reduce((s, [, lat]) => s + lat, 0) /
        boundary.coordinates.length,
    },
  }));
}

const normalizedBoundaries = normalizeBoundaries();

// Compute normalized centroids for tooltip positioning
function getNormalizedCentroid(boundary: (typeof normalizedBoundaries)[0]) {
  const coords = boundary.points.split(" ").map((p) => {
    const [x, y] = p.split(",").map(Number);
    return { x, y };
  });
  const cx = coords.reduce((s, c) => s + c.x, 0) / coords.length;
  const cy = coords.reduce((s, c) => s + c.y, 0) / coords.length;
  return { cx, cy };
}

const ndviLegend = [
  { label: "Ottimo", color: "#15803d", range: "≥ 0.70" },
  { label: "Buono", color: "#65a30d", range: "0.50–0.69" },
  { label: "Moderato", color: "#ca8a04", range: "0.35–0.49" },
  { label: "Stress", color: "#ea580c", range: "0.20–0.34" },
  { label: "Critico", color: "#dc2626", range: "< 0.20" },
];

function FieldTooltip({
  boundary,
  reading,
}: {
  boundary: FieldBoundary;
  reading: NDVIReading | undefined;
}) {
  const field = fields.find((f) => f.id === boundary.fieldId);
  return (
    <div className="rounded-xl border border-emerald-950/10 bg-white p-3 text-left shadow-lg">
      <p className="text-sm font-semibold text-emerald-950">
        {field?.name ?? boundary.cadastralRef}
      </p>
      {field && (
        <p className="mt-0.5 text-xs text-emerald-950/60">{field.crop}</p>
      )}
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-emerald-950/70">
        <span>Superficie</span>
        <span className="font-medium text-emerald-950">
          {boundary.areaHa.toLocaleString("it-IT")} ha
        </span>
        {reading && (
          <>
            <span>NDVI medio</span>
            <span className="font-medium text-emerald-950">
              {reading.meanNDVI.toFixed(2)}
            </span>
            <span>Stato</span>
            <span className="font-medium text-emerald-950">
              {healthStatusLabel(classifyNDVI(reading.meanNDVI)).split(" — ")[0]}
            </span>
          </>
        )}
      </div>
      <p className="mt-2 text-[10px] text-emerald-800/50">
        Clicca per dettagli →
      </p>
    </div>
  );
}

export function FieldMapPreview() {
  const [hoveredField, setHoveredField] = useState<string | null>(null);

  return (
    <div className="rounded-3xl border border-emerald-950/10 bg-[linear-gradient(160deg,rgba(240,253,244,0.95),rgba(220,252,231,0.6))] p-4 shadow-inner shadow-emerald-950/5">
      {/* SVG map with interactive fields */}
      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          className="h-72 w-full rounded-2xl bg-[#ecfdf5]"
          role="img"
          aria-label="Mappa sintetica degli appezzamenti con overlay NDVI"
        >
          <rect x="0" y="0" width="100" height="100" fill="#f0fdf4" />
          {normalizedBoundaries.map((boundary) => {
            const reading = latestReadings.get(boundary.fieldId);
            const fill = reading ? ndviToColor(reading.meanNDVI) : "#bbf7d0";
            const isHovered = hoveredField === boundary.fieldId;
            return (
              <g key={boundary.id}>
                <Link href={`/dashboard/fields#${boundary.fieldId}`}>
                  <polygon
                    points={boundary.points}
                    fill={fill}
                    fillOpacity={isHovered ? "1" : "0.82"}
                    stroke={isHovered ? "#064e3b" : "#14532d"}
                    strokeWidth={isHovered ? "1.4" : "0.8"}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredField(boundary.fieldId)}
                    onMouseLeave={() => setHoveredField(null)}
                  />
                </Link>
                {/* Field label on SVG */}
                {(() => {
                  const { cx, cy } = getNormalizedCentroid(boundary);
                  return (
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="pointer-events-none select-none fill-emerald-950/70 text-[3px] font-semibold"
                    >
                      {boundary.cadastralRef?.split("-").pop()}
                    </text>
                  );
                })()}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredField && (
          <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 animate-in-fade">
            {(() => {
              const boundary = fieldBoundaries.find(
                (b) => b.fieldId === hoveredField,
              );
              if (!boundary) return null;
              const reading = latestReadings.get(boundary.fieldId);
              return <FieldTooltip boundary={boundary} reading={reading} />;
            })()}
          </div>
        )}
      </div>

      {/* NDVI Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-white/60 px-3 py-2">
        <span className="text-xs font-semibold text-emerald-950/70">
          NDVI:
        </span>
        {ndviLegend.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="text-[11px] text-emerald-950/60">
              {item.label}{" "}
              <span className="text-emerald-950/40">({item.range})</span>
            </span>
          </div>
        ))}
      </div>

      {/* Field cards */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {normalizedBoundaries.map((boundary) => {
          const reading = latestReadings.get(boundary.fieldId);
          const field = fields.find((f) => f.id === boundary.fieldId);
          const isHovered = hoveredField === boundary.fieldId;
          return (
            <Link
              key={boundary.id}
              href={`/dashboard/fields#${boundary.fieldId}`}
              className={`block rounded-2xl bg-white/80 px-3 py-2 text-sm text-emerald-950/70 shadow-sm transition-all hover:bg-emerald-50 hover:shadow-md ${
                isHovered ? "ring-2 ring-emerald-600/40" : ""
              }`}
              onMouseEnter={() => setHoveredField(boundary.fieldId)}
              onMouseLeave={() => setHoveredField(null)}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: reading
                      ? ndviToColor(reading.meanNDVI)
                      : "#bbf7d0",
                  }}
                  aria-hidden="true"
                />
                <span className="font-semibold text-emerald-950">
                  {boundary.cadastralRef}
                </span>
              </div>
              {field && (
                <p className="mt-0.5 text-xs text-emerald-950/50">
                  {field.crop}
                </p>
              )}
              <p className="mt-1">
                {boundary.areaHa.toLocaleString("it-IT")} ha
                {reading && (
                  <span className="ml-2 text-xs text-emerald-950/50">
                    NDVI {reading.meanNDVI.toFixed(2)}
                  </span>
                )}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
