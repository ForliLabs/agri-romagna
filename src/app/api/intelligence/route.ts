import {
  getIntelligenceOverview,
  publishNDVIData,
  publishSensorReadings,
  publishWeatherUpdate,
} from "@/lib/intelligence-fabric";
import { getEventBusOverview } from "@/lib/event-bus";

export async function GET() {
  return Response.json({
    ...getIntelligenceOverview(),
    crossModuleEventBus: getEventBusOverview(),
  });
}

export async function POST() {
  publishWeatherUpdate();
  publishSensorReadings();
  publishNDVIData();

  return Response.json({
    ...getIntelligenceOverview(),
    crossModuleEventBus: getEventBusOverview(),
  });
}
