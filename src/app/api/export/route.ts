import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { createProblemResponse, withErrorHandling } from "@/lib/api-errors";
import {
  dataExporter,
  fieldExportSchema,
  financialExportSchema,
  complianceExportSchema,
} from "@/lib/data-export";
import prisma from "@/lib/prisma";

/**
 * GET /api/export — List available export types and recent export jobs.
 */
export const GET = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "analytics:read");
  if (denied) return denied;

  const jobs = dataExporter.getJobs();

  return createSuccessResponse({
    availableExports: [
      { type: "fields", formats: ["csv", "text"], description: "Esporta tutti i campi" },
      { type: "compliance", formats: ["csv", "text"], description: "Esporta record conformità" },
      { type: "financial", formats: ["csv", "text"], description: "Esporta dati finanziari" },
    ],
    recentJobs: jobs.slice(0, 20),
  });
});

/**
 * POST /api/export — Create a new export job.
 * Body: { type: "fields"|"compliance"|"financial", format: "csv"|"text" }
 */
export const POST = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "analytics:read");
  if (denied) return denied;

  const body = (await request.json()) as { type: string; format?: string };
  const format = (body.format ?? "csv") as "csv" | "text";

  if (!["csv", "text"].includes(format)) {
    return createProblemResponse(400, "Formato non valido", "Formati supportati: csv, text");
  }

  switch (body.type) {
    case "fields": {
      const job = await dataExporter.createExportJob(
        "fields",
        format,
        async () => {
          const fields = await prisma.field.findMany({
            select: {
              id: true, name: true, crop: true, areaHa: true,
              status: true, municipality: true, irrigation: true,
              health: true, plantingDate: true, expectedHarvest: true,
            },
          });
          return fields.map((f) => ({
            ...f,
            plantingDate: f.plantingDate.toISOString().slice(0, 10),
            expectedHarvest: f.expectedHarvest.toISOString().slice(0, 10),
          }));
        },
        fieldExportSchema,
        { title: "Esportazione Campi" }
      );
      return createSuccessResponse({ job }, { status: 202 });
    }

    case "compliance": {
      const job = await dataExporter.createExportJob(
        "compliance",
        format,
        async () => {
          const records = await prisma.complianceRecord.findMany({
            select: {
              id: true, type: true, status: true, title: true,
              fieldId: true, dueDate: true, completedDate: true, agencyRef: true,
            },
          });
          return records.map((r) => ({
            ...r,
            dueDate: r.dueDate.toISOString().slice(0, 10),
            completedDate: r.completedDate?.toISOString().slice(0, 10) ?? null,
          }));
        },
        complianceExportSchema,
        { title: "Esportazione Conformità" }
      );
      return createSuccessResponse({ job }, { status: 202 });
    }

    case "financial": {
      const job = await dataExporter.createExportJob(
        "financial",
        format,
        async () => {
          const costs = await prisma.costEntry.findMany({
            select: {
              id: true, category: true, description: true,
              amount: true, date: true, farmId: true,
            },
          });
          return costs.map((c) => ({
            ...c,
            date: c.date.toISOString().slice(0, 10),
          }));
        },
        financialExportSchema,
        { title: "Esportazione Finanziaria" }
      );
      return createSuccessResponse({ job }, { status: 202 });
    }

    default:
      return createProblemResponse(400, "Tipo non valido", "Tipi supportati: fields, compliance, financial");
  }
});
