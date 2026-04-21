import {
  sensorsStore,
  sensorReadings,
  alertRules,
  sensorAlerts,
  getLatestReadings,
} from "@/lib/iot-data";

export async function GET() {
  const devices = await sensorsStore.findAll();
  const latestMap = getLatestReadings();
  const latest = Object.fromEntries(latestMap);

  return Response.json({
    devices,
    latestReadings: latest,
    alertRules,
    alerts: sensorAlerts,
    stats: {
      totalDevices: devices.length,
      online: devices.filter((d) => d.status === "online").length,
      offline: devices.filter((d) => d.status === "offline").length,
      warnings: devices.filter((d) => d.status === "warning" || d.status === "error").length,
      totalReadings: sensorReadings.length,
    },
  });
}
