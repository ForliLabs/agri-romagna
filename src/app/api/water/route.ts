import type { IrrigationSchedule, IrrigationStatus } from "@/lib/water-management-data";
import { fields } from "@/lib/data";
import {
  calculateCropWaterNeed,
  calculateET0,
  getIrrigationRecommendation,
  getWaterEfficiencyMetrics,
  getWaterQuotaStatus,
  irrigationSchedulesStore,
  soilWaterBalanceStore,
  waterQuotasStore,
} from "@/lib/water-management-data";

const irrigationStatuses: IrrigationStatus[] = ["scheduled", "completed", "skipped"];

export async function GET() {
  const schedules = await irrigationSchedulesStore.findAll();
  const balances = await soilWaterBalanceStore.findAll();
  const quotas = await waterQuotasStore.findAll();

  return Response.json({
    et0: calculateET0(),
    schedules,
    balances,
    quotas,
    quotaStatus: getWaterQuotaStatus(),
    cropWaterNeeds: fields
      .map((field) => calculateCropWaterNeed(field.id))
      .filter(Boolean),
    recommendations: fields
      .map((field) => getIrrigationRecommendation(field.id))
      .filter(Boolean),
    efficiency: getWaterEfficiencyMetrics(),
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<IrrigationSchedule>;

  if (
    !payload.fieldId ||
    !payload.date ||
    typeof payload.recommendedMm !== "number" ||
    typeof payload.actualMm !== "number" ||
    !payload.method ||
    !payload.status
  ) {
    return Response.json(
      {
        error: "Campi richiesti: fieldId, date, recommendedMm, actualMm, method, status.",
      },
      { status: 400 }
    );
  }

  if (!irrigationStatuses.includes(payload.status)) {
    return Response.json({ error: "Stato irrigazione non valido." }, { status: 400 });
  }

  const schedule: IrrigationSchedule = {
    id: payload.id ?? `irrigation-${crypto.randomUUID()}`,
    fieldId: payload.fieldId,
    date: payload.date,
    recommendedMm: payload.recommendedMm,
    actualMm: payload.actualMm,
    method: payload.method,
    status: payload.status,
  };

  const createdSchedule = await irrigationSchedulesStore.create(schedule);
  return Response.json({ schedule: createdSchedule }, { status: 201 });
}
