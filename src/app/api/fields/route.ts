import { farm, fields as seedFields } from "@/lib/data";
import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { createProblemResponse, validateBody, withErrorHandling } from "@/lib/api-errors";
import { fieldQueries } from "@/lib/data-layer";
import { fieldOperationalPriorities } from "@/lib/operations-insights";
import { createFieldSchema } from "@/lib/validators/schemas";

export const GET = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "fields:read");
  if (denied) return denied;

  const dbFields = await fieldQueries.findOperationalOverview();
  const fields = dbFields.length
    ? dbFields.map((field) => ({
        id: field.id,
        name: field.name,
        crop: field.crop,
        areaHa: field.areaHa,
        status: field.status,
        plantingDate: field.plantingDate,
        municipality: field.municipality,
        expectedHarvest: field.expectedHarvest,
        expectedVolume: field.expectedVolume,
        health: field.health,
        irrigation: field.irrigation,
        notes: field.notes,
        farm: field.farm,
        sensorCount: field.sensorDevices.length,
        openLots: field.productLots.length,
        nextHarvestDeclaration: field.harvestDeclarations[0] ?? null,
      }))
    : seedFields.map((field) => ({
        ...field,
        farm: null,
        sensorCount: 0,
        openLots: 0,
        nextHarvestDeclaration: null,
      }));

  return createSuccessResponse(
    {
      farm,
      fields,
      priorities: fieldOperationalPriorities,
      summary: {
        totalFields: fields.length,
        fieldsNeedingAction: fieldOperationalPriorities.filter((item) => item.severity !== "bassa").length,
        scheduledHarvests: fields.filter((field) => field.expectedHarvest).length,
        connectedSensors: fields.reduce((sum, field) => sum + field.sensorCount, 0),
      },
    },
    { meta: { domain: "fields" } }
  );
});

export const POST = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "fields:write");
  if (denied) return denied;

  const parsed = await validateBody(request, createFieldSchema);
  if (parsed.error) return parsed.error;

  const field = await fieldQueries.create({
    id: `field-${crypto.randomUUID()}`,
    ...parsed.data,
    municipality: parsed.data.municipality ?? farm.location,
    expectedHarvest: parsed.data.expectedHarvest ?? new Date().toISOString().slice(0, 10),
    expectedVolume: parsed.data.expectedVolume ?? 0,
    health: parsed.data.health ?? "Monitoraggio iniziale impostato",
    irrigation: parsed.data.irrigation ?? "Da configurare",
    notes: parsed.data.notes ?? "Nuovo appezzamento registrato via API.",
    farmId: parsed.data.farmId ?? "azienda-tondini",
  });

  return createSuccessResponse({ field }, { status: 201, meta: { domain: "fields" } });
});

export const PUT = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "fields:write");
  if (denied) return denied;

  const body = await request.json() as { id: string } & Record<string, unknown>;
  if (!body.id) {
    return createProblemResponse(400, "ID mancante", "L'ID del campo è obbligatorio per l'aggiornamento.");
  }

  const existing = await fieldQueries.findById(body.id);
  if (!existing) {
    return createProblemResponse(404, "Campo non trovato", "Il campo specificato non esiste.");
  }

  const { id, ...updates } = body;
  const field = await fieldQueries.update(id, updates);

  return createSuccessResponse({ field }, { meta: { domain: "fields" } });
});

export const DELETE = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "fields:write");
  if (denied) return denied;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return createProblemResponse(400, "ID mancante", "L'ID del campo è obbligatorio per l'eliminazione.");
  }

  const existing = await fieldQueries.findById(id);
  if (!existing) {
    return createProblemResponse(404, "Campo non trovato", "Il campo specificato non esiste.");
  }

  await fieldQueries.delete(id);

  return createSuccessResponse({ deleted: true, id }, { meta: { domain: "fields" } });
});
