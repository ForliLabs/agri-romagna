import {
  alertRulesStore,
  getActiveAlerts,
  getTopInsights,
  insightResultsStore,
  insightTemplatesStore,
  nlQueriesStore,
} from "@/lib/insight-engine-data";
import { withAuth } from "@/lib/api-response";

export const GET = withAuth("insights:read", async () => {
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
});
