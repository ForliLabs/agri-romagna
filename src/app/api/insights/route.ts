import {
  alertRulesStore,
  getActiveAlerts,
  getTopInsights,
  insightResultsStore,
  insightTemplatesStore,
  nlQueriesStore,
} from "@/lib/insight-engine-data";

export async function GET() {
  const [templates, insightResults, alerts, queries] = await Promise.all([
    insightTemplatesStore.findAll(),
    insightResultsStore.findAll(),
    alertRulesStore.findAll(),
    nlQueriesStore.findAll(),
  ]);

  return Response.json({
    templates,
    insights: getTopInsights(8),
    insightResults,
    alerts,
    activeAlerts: getActiveAlerts(),
    queries,
  });
}
