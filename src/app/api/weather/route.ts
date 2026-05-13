import { farm } from "@/lib/data";
import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/api-errors";
import { fieldOperationalPriorities, weatherWorkflowWindows } from "@/lib/operations-insights";
import {
  fetchCurrentWeather,
  fetchForecast,
  fetchRiverLevels,
  generateWeatherAlerts,
} from "@/lib/weather-service";

export const GET = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "weather:read");
  if (denied) return denied;

  const [current, forecast, rivers] = await Promise.all([
    fetchCurrentWeather(),
    fetchForecast(),
    fetchRiverLevels(),
  ]);
  const alerts = await generateWeatherAlerts({ forecast, rivers });

  return createSuccessResponse(
    {
      farm,
      weather: { current, forecast, rivers, alerts },
      workflowWindows: weatherWorkflowWindows,
      impactedFields: fieldOperationalPriorities.filter((item) => item.relatedModules.includes("Meteo")),
    },
    { meta: { domain: "weather" } }
  );
});
