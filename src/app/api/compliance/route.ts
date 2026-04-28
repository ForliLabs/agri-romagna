import {
  capDeclarations,
  organicCertifications,
  getComplianceSummary,
} from "@/lib/compliance-data";
import { complianceRecordQueries, complianceEventQueries } from "@/lib/data-layer";

export async function GET() {
  const records = await complianceRecordQueries.findAll();
  const events = await complianceEventQueries.findAll();
  const summary = getComplianceSummary(records as any);

  return Response.json({
    records,
    events,
    capDeclarations,
    organicCertifications,
    summary,
  });
}
