import { alertRules, sensorAlerts, sensorReadings, sensorTypeLabels, sensorTypeUnits, mqttConfig, mqttTopic, sensorDevices } from "@/lib/iot-data";
import type { SensorDevice, SensorReading, AlertRule, SensorAlert } from "@/lib/iot-data";
import { sensorDeviceQueries } from "@/lib/data-layer";
import { authorizeRoute, createSuccessResponse } from "@/lib/api-response";
import { createProblemResponse, withErrorHandling } from "@/lib/api-errors";
import { iotAreaHealth, iotAttentionList, iotSnapshot } from "@/lib/operations-insights";

// Alert rules and alerts remain in-memory (no Prisma model yet)
const alertRulesList = [...alertRules];
const alertsList = [...sensorAlerts];

/**
 * GET /api/iot — Returns devices, readings, alerts, and configuration.
 * POST /api/iot — Register sensors, submit readings, manage alert rules.
 */
export const GET = withErrorHandling(async (request: Request) => {
  const { user, denied } = await authorizeRoute(request, "iot:read");
  if (denied) return denied;

  const url = new URL(request.url);
  const sensorId = url.searchParams.get("sensorId");
  const farmId = user?.farmId ?? "azienda-tondini";

  // Use Prisma data if available, fall back to seed data
  const dbDevices = await sensorDeviceQueries.findAll() as { id: string }[];
  const devices = dbDevices.length > 0 ? dbDevices as unknown as SensorDevice[] : sensorDevices;
  const latest = Object.fromEntries(iotSnapshot.latestReadings);

  if (sensorId) {
    const device = devices.find((d) => d.id === sensorId);
    if (!device) {
      return createProblemResponse(404, "Sensore non trovato", "Il sensore specificato non esiste.");
    }
    const readings = sensorReadings.filter((r) => r.sensorId === sensorId);
    const rules = alertRulesList.filter((r) => r.sensorId === sensorId);
    const alerts = alertsList.filter((a) => a.sensorId === sensorId);

    return createSuccessResponse(
      {
        device,
        readings: readings.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
        latestReading: latest[sensorId] ?? null,
        rules,
        alerts: alerts.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
        mqttTopic: mqttTopic(farmId, device.fieldId, device.id),
      },
      { meta: { domain: "iot" } }
    );
  }

  return createSuccessResponse(
    {
      devices,
      latestReadings: latest,
      alertRules: alertRulesList,
      alerts: alertsList,
      fieldHealth: iotAreaHealth,
      attentionSensors: iotAttentionList,
      mqttConfig,
      sensorTypes: sensorTypeLabels,
      sensorUnits: sensorTypeUnits,
      stats: {
        totalDevices: devices.length,
        online: devices.filter((device) => device.status === "online").length,
        offline: devices.filter((device) => device.status === "offline").length,
        warnings: devices.filter(
          (device) => device.status === "warning" || device.status === "error"
        ).length,
        lowBattery: devices.filter((device) => device.batteryPercent < 20).length,
        totalHistoryPoints: Array.from(iotSnapshot.sensorHistoryMap.values()).reduce(
          (sum, readings) => sum + readings.length,
          0
        ),
      },
    },
    { meta: { domain: "iot" } }
  );
});

export const POST = withErrorHandling(async (request: Request) => {
  const { user, denied } = await authorizeRoute(request, "iot:write");
  if (denied) return denied;
  const _farmId = user?.farmId ?? "azienda-tondini";

  const body = (await request.json()) as {
    action: "register-sensor" | "submit-reading" | "create-rule" | "update-rule" | "acknowledge-alert";
    sensor?: Record<string, unknown>;
    reading?: { sensorId: string; value: number; unit?: string };
    rule?: Record<string, unknown>;
    ruleId?: string;
    alertId?: string;
  };

  if (body.action === "register-sensor" && body.sensor) {
    const sensor = await sensorDeviceQueries.create({
      name: body.sensor.name as string,
      type: body.sensor.type as string,
      fieldId: body.sensor.fieldId as string,
      status: "online",
      batteryLevel: 100,
      firmware: (body.sensor.firmware as string) ?? "v1.0.0",
    });
    return createSuccessResponse(
      {
        sensor,
        mqttConfig,
      },
      { status: 201, meta: { domain: "iot" } }
    );
  }

  if (body.action === "submit-reading" && body.reading) {
    const dbDevices = await sensorDeviceQueries.findAll() as { id: string }[];
    const allDevices = dbDevices.length > 0 ? dbDevices : sensorDevices;
    const sensor = allDevices.find((d) => d.id === body.reading!.sensorId) as SensorDevice | undefined;
    if (!sensor) {
      return createProblemResponse(404, "Sensore non trovato", "Il sensore specificato non esiste.");
    }

    const reading: SensorReading = {
      id: `reading-${Date.now()}`,
      sensorId: body.reading.sensorId,
      timestamp: new Date().toISOString(),
      value: body.reading.value,
      unit: body.reading.unit ?? sensorTypeUnits[sensor.type],
    };

    // Check alert rules
    const triggeredAlerts: SensorAlert[] = [];
    const rules = alertRulesList.filter((r) => r.sensorId === sensor.id && r.active);
    for (const rule of rules) {
      const triggered =
        (rule.condition === "above" && reading.value > rule.threshold) ||
        (rule.condition === "below" && reading.value < rule.threshold);

      if (triggered) {
        const alert: SensorAlert = {
          id: `salert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          ruleId: rule.id,
          sensorId: sensor.id,
          sensorName: sensor.name,
          timestamp: reading.timestamp,
          value: reading.value,
          threshold: rule.threshold,
          message: `${sensor.name}: valore ${reading.value} ${reading.unit} ${
            rule.condition === "above" ? "sopra" : "sotto"
          } soglia ${rule.threshold} ${rule.unit}. Regola: ${rule.name}.`,
          acknowledged: false,
        };
        alertsList.push(alert);
        rule.lastTriggered = reading.timestamp;
        triggeredAlerts.push(alert);
      }
    }

    return createSuccessResponse(
      { reading, triggeredAlerts },
      { status: 201, meta: { domain: "iot" } }
    );
  }

  if (body.action === "create-rule" && body.rule) {
    const rule: AlertRule = {
      id: `rule-${Date.now()}`,
      sensorId: body.rule.sensorId as string,
      name: body.rule.name as string,
      condition: body.rule.condition as "above" | "below",
      threshold: body.rule.threshold as number,
      unit: body.rule.unit as string,
      active: true,
    };
    alertRulesList.push(rule);
    return createSuccessResponse({ rule }, { status: 201, meta: { domain: "iot" } });
  }

  if (body.action === "update-rule" && body.ruleId) {
    const ruleIndex = alertRulesList.findIndex((r) => r.id === body.ruleId);
    if (ruleIndex === -1) {
      return createProblemResponse(404, "Regola non trovata", "La regola specificata non esiste.");
    }
    Object.assign(alertRulesList[ruleIndex], body.rule ?? {});
    return createSuccessResponse({ rule: alertRulesList[ruleIndex] }, { meta: { domain: "iot" } });
  }

  if (body.action === "acknowledge-alert" && body.alertId) {
    const alert = alertsList.find((a) => a.id === body.alertId);
    if (!alert) {
      return createProblemResponse(404, "Alert non trovato", "L'alert specificato non esiste.");
    }
    alert.acknowledged = true;
    return createSuccessResponse({ alert }, { meta: { domain: "iot" } });
  }

  return createProblemResponse(
    400,
    "Azione non valida",
    "Usa: register-sensor, submit-reading, create-rule, update-rule, acknowledge-alert."
  );
});

export const PUT = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "iot:write");
  if (denied) return denied;

  const body = (await request.json()) as { id: string } & Record<string, unknown>;
  if (!body.id) {
    return createProblemResponse(400, "ID mancante", "L'ID del sensore è obbligatorio.");
  }

  const existing = await sensorDeviceQueries.findById(body.id);
  if (!existing) {
    return createProblemResponse(404, "Sensore non trovato", "Il sensore specificato non esiste.");
  }

  const { id, ...updates } = body;
  const updated = await sensorDeviceQueries.update(id, updates);
  return createSuccessResponse({ sensor: updated }, { meta: { domain: "iot" } });
});

export const DELETE = withErrorHandling(async (request: Request) => {
  const { denied } = await authorizeRoute(request, "iot:write");
  if (denied) return denied;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return createProblemResponse(400, "ID mancante", "L'ID del sensore è obbligatorio.");
  }

  const existing = await sensorDeviceQueries.findById(id);
  if (!existing) {
    return createProblemResponse(404, "Sensore non trovato", "Il sensore specificato non esiste.");
  }

  await sensorDeviceQueries.delete(id);

  return createSuccessResponse({ deleted: true, id }, { meta: { domain: "iot" } });
});
