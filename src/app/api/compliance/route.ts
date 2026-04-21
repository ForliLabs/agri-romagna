import {
  complianceRecordsStore,
  complianceEventsStore,
  capDeclarations,
  organicCertifications,
  getComplianceSummary,
} from "@/lib/compliance-data";

export async function GET() {
  const records = await complianceRecordsStore.findAll();
  const events = await complianceEventsStore.findAll();
  const summary = getComplianceSummary(records);

  return Response.json({
    records,
    events,
    capDeclarations,
    organicCertifications,
    summary,
  });
}
