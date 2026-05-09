import {
  getIntelligenceOverview,
  publishNDVIData,
  publishSensorReadings,
  publishWeatherUpdate,
} from "@/lib/intelligence-fabric";
import { getEventBusOverview } from "@/lib/event-bus";
import { withAuth } from "@/lib/api-response";

export const GET = withAuth("intelligence:read", async () => {
  return Response.json({
    ...getIntelligenceOverview(),
    crossModuleEventBus: getEventBusOverview(),
  });
});

export const POST = withAuth("intelligence:read", async () => {
  publishWeatherUpdate();
  publishSensorReadings();
  publishNDVIData();

  return Response.json({
    ...getIntelligenceOverview(),
    crossModuleEventBus: getEventBusOverview(),
  });
});
