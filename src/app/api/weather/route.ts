import { farm, weatherData } from "@/lib/data";
import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-errors";
import { fieldOperationalPriorities, weatherWorkflowWindows } from "@/lib/operations-insights";

export const GET = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "weather:read");
  if (denied) return denied;

  return createSuccessResponse(
    {
      farm,
      weather: weatherData,
      workflowWindows: weatherWorkflowWindows,
      impactedFields: fieldOperationalPriorities.filter((item) => item.relatedModules.includes("Meteo")),
    },
    { meta: { domain: "weather" } }
  );
});
