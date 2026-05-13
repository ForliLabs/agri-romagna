import {
  fetchCurrentWeather,
  fetchForecast,
  fetchRiverLevels,
  generateWeatherAlerts,
  generateNotifications,
} from "@/lib/weather-service";
import { withAuth } from "@/lib/api-response";

export const GET = withAuth("weather:read", async () => {
  try {
    const [current, forecast, rivers] = await Promise.all([
      fetchCurrentWeather(),
      fetchForecast(),
      fetchRiverLevels(),
    ]);
    const alerts = await generateWeatherAlerts({ forecast, rivers });

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
});
