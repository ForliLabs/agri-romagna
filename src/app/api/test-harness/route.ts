import {
  ciBuildsStore,
  coverageReportsStore,
  getCoverageOverview,
  getTestSummary,
  testSuitesStore,
} from "@/lib/test-harness-data";

export async function GET() {
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
}
