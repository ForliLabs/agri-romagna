import {
  sensorReadings,
  alertRules,
  sensorAlerts,
  getLatestReadings,
} from "@/lib/iot-data";
import { sensorDeviceQueries } from "@/lib/data-layer";

export async function GET() {
  const devices = await sensorDeviceQueries.findAll();
  const latestMap = getLatestReadings();
  const latest = Object.fromEntries(latestMap);

  return Response.json({
    devices,
    latestReadings: latest,
    alertRules,
    alerts: sensorAlerts,
    stats: {
      totalDevices: (devices as any[]).length,
      online: (devices as any[]).filter((d: any) => d.status === "online").length,
      offline: (devices as any[]).filter((d: any) => d.status === "offline").length,
      warnings: (devices as any[]).filter(
        (d: any) => d.status === "warning" || d.status === "error"
      ).length,
      totalReadings: sensorReadings.length,
    },
  });
}
