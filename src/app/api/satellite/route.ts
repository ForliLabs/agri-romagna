import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { createProblemResponse, withErrorHandling } from "@/lib/api-errors";
import {
  fieldBoundaries,
  ndviStore,
  cropHealthAlerts,
  upcomingPasses,
  getLatestNDVIByField,
  classifyNDVI,
  ndviToColor,
  healthStatusLabel,
} from "@/lib/satellite-data";

/**
 * GET /api/satellite — Returns field boundaries, NDVI data, health alerts, and passes.
 * POST /api/satellite — Manages field boundaries (add/update polygon coordinates).
 */
export const GET = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "satellite:read");
  if (denied) return denied;

  const url = new URL(request.url);
  const fieldId = url.searchParams.get("fieldId");

  const allReadings = await ndviStore.findAll();
  const latestByField = getLatestNDVIByField(allReadings);

  if (fieldId) {
    const boundary = fieldBoundaries.find((b) => b.fieldId === fieldId);
    const fieldReadings = allReadings.filter((r) => r.fieldId === fieldId);
    const latest = latestByField.get(fieldId);
    const alerts = cropHealthAlerts.filter((a) => a.fieldId === fieldId);

    return createSuccessResponse(
      {
        fieldId,
        boundary: boundary ?? null,
        readings: fieldReadings,
        latest: latest
          ? {
              ...latest,
              color: ndviToColor(latest.meanNDVI),
              label: healthStatusLabel(latest.healthStatus),
            }
          : null,
        alerts,
        trend: fieldReadings.map((r) => ({
          date: r.date,
          ndvi: r.meanNDVI,
          status: r.healthStatus,
        })),
      },
      { meta: { domain: "satellite" } }
    );
  }

  // Overview for all fields
  const fieldOverview = fieldBoundaries.map((boundary) => {
    const latest = latestByField.get(boundary.fieldId);
    return {
      fieldId: boundary.fieldId,
      boundary,
      latestNDVI: latest?.meanNDVI ?? null,
      healthStatus: latest?.healthStatus ?? null,
      healthColor: latest ? ndviToColor(latest.meanNDVI) : "#9ca3af",
      healthLabel: latest ? healthStatusLabel(latest.healthStatus) : "Nessun dato",
      lastDate: latest?.date ?? null,
    };
  });

  return createSuccessResponse(
    {
      fields: fieldOverview,
      healthAlerts: cropHealthAlerts,
      upcomingPasses,
      stats: {
        totalFields: fieldBoundaries.length,
        mappedFields: fieldBoundaries.length,
        totalReadings: allReadings.length,
        activeAlerts: cropHealthAlerts.filter((a) => a.severity !== "info").length,
        nextUsablePass: upcomingPasses.find((p) => p.usable)?.date ?? null,
      },
      // GeoJSON FeatureCollection for map rendering
      geojson: {
        type: "FeatureCollection",
        features: fieldBoundaries.map((b) => ({
          type: "Feature",
          properties: {
            fieldId: b.fieldId,
            areaHa: b.areaHa,
            cadastralRef: b.cadastralRef,
            ndvi: latestByField.get(b.fieldId)?.meanNDVI ?? null,
            healthStatus: latestByField.get(b.fieldId)?.healthStatus ?? null,
            fillColor: latestByField.has(b.fieldId)
              ? ndviToColor(latestByField.get(b.fieldId)!.meanNDVI)
              : "#9ca3af",
          },
          geometry: {
            type: "Polygon",
            coordinates: [[...b.coordinates, b.coordinates[0]]],
          },
        })),
      },
    },
    { meta: { domain: "satellite" } }
  );
});

export const POST = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "satellite:read");
  if (denied) return denied;

  const body = (await request.json()) as {
    action: "add-boundary" | "add-reading";
    fieldId: string;
    coordinates?: [number, number][];
    areaHa?: number;
    cadastralRef?: string;
    ndvi?: number;
    cloudCover?: number;
  };

  if (body.action === "add-reading" && body.fieldId && body.ndvi !== undefined) {
    const reading = {
      id: `ndvi-${body.fieldId}-${Date.now()}`,
      fieldId: body.fieldId,
      date: new Date().toISOString().slice(0, 10),
      meanNDVI: body.ndvi,
      minNDVI: body.ndvi - 0.08,
      maxNDVI: body.ndvi + 0.08,
      cloudCoverPercent: body.cloudCover ?? 10,
      source: "sentinel-2" as const,
      healthStatus: classifyNDVI(body.ndvi),
    };
    await ndviStore.create(reading);
    return createSuccessResponse({ reading }, { status: 201, meta: { domain: "satellite" } });
  }

  return createProblemResponse(400, "Azione non valida", "Usa: add-boundary, add-reading.");
});
