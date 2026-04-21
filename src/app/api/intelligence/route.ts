import {
  getIntelligenceOverview,
  publishNDVIData,
  publishSensorReadings,
  publishWeatherUpdate,
} from "@/lib/intelligence-fabric";

export async function GET() {
  return Response.json(getIntelligenceOverview());
}

export async function POST() {
  publishWeatherUpdate();
  publishSensorReadings();
  publishNDVIData();

  return Response.json(getIntelligenceOverview());
}
