import { farm, weatherData } from "@/lib/data";

export async function GET() {
  return Response.json({ farm, weather: weatherData });
}
