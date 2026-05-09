import {
  ciBuildsStore,
  coverageReportsStore,
  getCoverageOverview,
  getTestSummary,
  testSuitesStore,
} from "@/lib/test-harness-data";
import { withAuth } from "@/lib/api-response";

export const GET = withAuth("test-harness:read", async () => {
  const [testSuites, ciBuilds, coverageReports] = await Promise.all([
    testSuitesStore.findAll(),
    ciBuildsStore.findAll(),
    coverageReportsStore.findAll(),
  ]);

  return Response.json({
    testSuites,
    ciBuilds,
    coverageReports,
    coverageData: getCoverageOverview(),
    summary: getTestSummary(),
  });
});
