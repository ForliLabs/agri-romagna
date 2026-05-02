import {
  alertRules,
  getLatestReadings,
  sensorAlerts,
  sensorReadings,
  sensorsStore,
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
      online: devices.filter((device) => device.status === "online").length,
      offline: devices.filter((device) => device.status === "offline").length,
      warnings: devices.filter(
        (device) => device.status === "warning" || device.status === "error"
      ).length,
      totalReadings: sensorReadings.length,
    },
  });
}
