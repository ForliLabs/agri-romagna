import {
  fetchCurrentWeather,
  fetchForecast,
  fetchRiverLevels,
  generateWeatherAlerts,
  generateNotifications,
} from "@/lib/weather-service";

export async function GET() {
  try {
    const [current, forecast, rivers, alerts] = await Promise.all([
      fetchCurrentWeather(),
      fetchForecast(),
      fetchRiverLevels(),
      generateWeatherAlerts(),
    ]);

    const notifications = generateNotifications(alerts);

    return Response.json({
      current,
      forecast,
      rivers,
      alerts,
      notifications,
      meta: {
        source: "OpenMeteo + ARPAE (simulated rivers)",
        updatedAt: new Date().toISOString(),
        cachePolicy: "weather: 15min, forecast: 1h, rivers: 10min",
      },
    });
  } catch {
    return Response.json(
      { error: "Impossibile recuperare i dati meteo." },
      { status: 500 }
    );
  }
}
