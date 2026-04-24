import type { ExportFormat, ExportJob, ExportJobStatus, ExportScope } from "@/lib/fmis-interop-data";
import { exportJobsStore, getInteropDashboard } from "@/lib/fmis-interop-data";

const exportFormats: ExportFormat[] = [
  "isobus_iso11783",
  "geojson_inspire",
  "efdi_json",
  "agea_xml",
  "sian_csv",
  "arpae_json",
];
const exportScopes: ExportScope[] = ["field", "farm", "cooperative"];
const exportStatuses: ExportJobStatus[] = ["pending", "processing", "completed", "failed"];

export async function GET() {
  return Response.json(getInteropDashboard());
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<ExportJob>;

  if (!payload.format || !payload.scope) {
    return Response.json(
      {
        error: "Campi richiesti: format, scope.",
      },
      { status: 400 }
    );
  }

  if (!exportFormats.includes(payload.format)) {
    return Response.json({ error: "Formato export non valido." }, { status: 400 });
  }

  if (!exportScopes.includes(payload.scope)) {
    return Response.json({ error: "Scope export non valido." }, { status: 400 });
  }

  if (payload.status && !exportStatuses.includes(payload.status)) {
    return Response.json({ error: "Stato job non valido." }, { status: 400 });
  }

  const exportJob: ExportJob = {
    id: payload.id ?? `job-${crypto.randomUUID()}`,
    format: payload.format,
    scope: payload.scope,
    status: payload.status ?? "pending",
    createdAt: payload.createdAt ?? new Date().toISOString(),
    completedAt: payload.completedAt,
    fileSize: payload.fileSize ?? 0,
    recordCount: payload.recordCount ?? 0,
  };

  const createdJob = await exportJobsStore.create(exportJob);
  return Response.json({ exportJob: createdJob }, { status: 201 });
}
