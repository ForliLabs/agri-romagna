import { fields } from "@/lib/data";
import {
  calculateCropWaterNeed,
  calculateET0,
  getIrrigationRecommendation,
  getWaterEfficiencyMetrics,
  getWaterQuotaStatus,
  soilWaterBalanceStore,
  waterQuotasStore,
} from "@/lib/water-management-data";
import { irrigationScheduleQueries } from "@/lib/data-layer";
import { withAuth } from "@/lib/api-response";

export const GET = withAuth("water:read", async () => {
  const schedules = await irrigationScheduleQueries.findAll();
  const balances = await soilWaterBalanceStore.findAll();
  const quotas = await waterQuotasStore.findAll();

  return Response.json({
    et0: calculateET0(),
    schedules,
    balances,
    quotas,
    quotaStatus: getWaterQuotaStatus(),
    cropWaterNeeds: fields.map((field) => calculateCropWaterNeed(field.id)).filter(Boolean),
    recommendations: fields
      .map((field) => getIrrigationRecommendation(field.id))
      .filter(Boolean),
    efficiency: getWaterEfficiencyMetrics(),
  });
});

export async function POST(request: Request) {
  const payload = await request.json();

  if (!payload.fieldId || !payload.startDate || !payload.method) {
    return Response.json(
      { error: "Campi richiesti: fieldId, startDate, method." },
      { status: 400 }
    );
  }

  const schedule = await irrigationScheduleQueries.create({
    id: payload.id ?? `irrigation-${crypto.randomUUID()}`,
    fieldId: payload.fieldId,
    method: payload.method,
    startDate: new Date(payload.startDate ?? payload.date),
    endDate: new Date(payload.endDate ?? payload.date ?? payload.startDate),
    waterMm: payload.actualMm ?? payload.waterMm ?? 0,
    status: payload.status ?? "scheduled",
    frequency: payload.frequency ?? "once",
  });

  return Response.json({ schedule }, { status: 201 });
}
