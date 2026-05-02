import {
  capDeclarations,
  complianceEventsStore,
  complianceRecordsStore,
  getComplianceSummary,
  organicCertifications,
} from "@/lib/compliance-data";

export async function GET() {
  const records = await complianceRecordsStore.findAll();
  const events = await complianceEventsStore.findAll();

  return Response.json({
    records,
    events,
    capDeclarations,
    organicCertifications,
    summary: getComplianceSummary(records),
  });
}
