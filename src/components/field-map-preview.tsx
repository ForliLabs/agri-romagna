import { fieldBoundaries, getLatestNDVIByField, ndviReadings, ndviToColor } from "@/lib/satellite-data";

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
  }));
}

const normalizedBoundaries = normalizeBoundaries();

export function FieldMapPreview() {
  return (
    <div className="rounded-3xl border border-emerald-950/10 bg-[linear-gradient(160deg,rgba(240,253,244,0.95),rgba(220,252,231,0.6))] p-4 shadow-inner shadow-emerald-950/5">
      <svg viewBox="0 0 100 100" className="h-72 w-full rounded-2xl bg-[#ecfdf5]" role="img" aria-label="Mappa sintetica degli appezzamenti con overlay NDVI">
        <rect x="0" y="0" width="100" height="100" fill="#f0fdf4" />
        {normalizedBoundaries.map((boundary) => {
          const reading = latestReadings.get(boundary.fieldId);
          const fill = reading ? ndviToColor(reading.meanNDVI) : "#bbf7d0";
          return (
            <g key={boundary.id}>
              <polygon points={boundary.points} fill={fill} fillOpacity="0.82" stroke="#14532d" strokeWidth="0.8" />
            </g>
          );
        })}
      </svg>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {normalizedBoundaries.map((boundary) => {
          const reading = latestReadings.get(boundary.fieldId);
          return (
            <div key={boundary.id} className="rounded-2xl bg-white/80 px-3 py-2 text-sm text-emerald-950/70 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: reading ? ndviToColor(reading.meanNDVI) : "#bbf7d0" }} aria-hidden="true" />
                <span className="font-semibold text-emerald-950">{boundary.cadastralRef}</span>
              </div>
              <p className="mt-1">{boundary.areaHa.toLocaleString("it-IT")} ha</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
