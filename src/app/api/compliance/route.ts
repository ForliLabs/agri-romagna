import {
  capDeclarations,
  complianceEventsStore,
  complianceRecordsStore,
  getComplianceSummary,
  organicCertifications,
} from "@/lib/compliance-data";
import type { EventType } from "@/lib/compliance-data";
import {
  generateAGEAReport,
  generateComplianceCSV,
  generateOrganicAuditReport,
  generateComplianceSummaryReport,
} from "@/lib/compliance-export";
import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { createProblemResponse, withErrorHandling } from "@/lib/api-errors";

export const GET = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "compliance:read");
  if (denied) return denied;

  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const type = url.searchParams.get("type");

  const records = await complianceRecordsStore.findAll();
  const events = await complianceEventsStore.findAll();

  // Export in AGEA XML format
  if (format === "agea" && type === "cap") {
    const declaration = capDeclarations[0];
    if (!declaration) {
      return createProblemResponse(404, "Dichiarazione non trovata", "Nessuna dichiarazione PAC disponibile.");
    }
    const xml = generateAGEAReport(declaration, events);
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="pac-${declaration.year}-${declaration.farmId}.xml"`,
      },
    });
  }

  // Export as CSV
  if (format === "csv") {
    const csv = generateComplianceCSV(records, events);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="conformita-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  // Export organic audit report
  if (format === "audit" && type === "organic") {
    const cert = organicCertifications[0];
    if (!cert) {
      return createProblemResponse(404, "Certificazione non trovata", "Nessuna certificazione biologica disponibile.");
    }
    const report = generateOrganicAuditReport(cert, events);
    return new Response(report, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="audit-bio-${cert.certNumber}.txt"`,
      },
    });
  }

  // Default: JSON summary with all data
  const summaryReport = generateComplianceSummaryReport(records, capDeclarations, organicCertifications);

  return createSuccessResponse(
    {
      records,
      events,
      capDeclarations,
      organicCertifications,
      summary: getComplianceSummary(records),
      report: summaryReport,
      exportFormats: [
        { format: "agea", type: "cap", label: "Dichiarazione PAC (XML AGEA)" },
        { format: "csv", type: "all", label: "Registro completo (CSV)" },
        { format: "audit", type: "organic", label: "Rapporto audit biologico (TXT)" },
      ],
    },
    { meta: { domain: "compliance" } }
  );
});

export const POST = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "compliance:write");
  if (denied) return denied;

  const body = (await request.json()) as {
    action: "add-event" | "update-record";
    event?: Record<string, unknown>;
    recordId?: string;
    updates?: Record<string, unknown>;
  };

  if (body.action === "add-event" && body.event) {
    const event = {
      id: `evt-${Date.now()}`,
      recordId: body.event.recordId as string,
      fieldId: body.event.fieldId as string,
      type: body.event.type as EventType,
      date: (body.event.date as string) ?? new Date().toISOString().slice(0, 10),
      description: body.event.description as string,
      operator: body.event.operator as string,
      product: body.event.product as string | undefined,
      quantity: body.event.quantity as string | undefined,
      notes: (body.event.notes as string) ?? "",
      verified: false,
    };
    await complianceEventsStore.create(event);
    return createSuccessResponse({ event }, { status: 201, meta: { domain: "compliance" } });
  }

  if (body.action === "update-record" && body.recordId && body.updates) {
    const updated = await complianceRecordsStore.update(body.recordId, body.updates as Record<string, string>);
    if (!updated) {
      return createProblemResponse(404, "Record non trovato", "Il record di conformità richiesto non esiste.");
    }
    return createSuccessResponse({ record: updated }, { meta: { domain: "compliance" } });
  }

  return createProblemResponse(400, "Azione non valida", "Usa: add-event, update-record.");
});
