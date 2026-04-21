import { InMemoryStore } from "@/lib/db";

// --- IoT Sensor Types ---

export type SensorType = "soil_moisture" | "temperature" | "humidity" | "rain_gauge" | "wind" | "cold_chain" | "irrigation_flow";

export type SensorStatus = "online" | "offline" | "warning" | "error";

export interface SensorDevice {
  id: string;
  name: string;
  type: SensorType;
  fieldId: string;
  fieldName: string;
  protocol: "mqtt" | "lorawan" | "wifi" | "zigbee";
  status: SensorStatus;
  batteryPercent: number;
  lastSeen: string;
  firmware: string;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  timestamp: string;
  value: number;
  unit: string;
}

export interface AlertRule {
  id: string;
  sensorId: string;
  name: string;
  condition: "above" | "below";
  threshold: number;
  unit: string;
  active: boolean;
  lastTriggered?: string;
}

export interface SensorAlert {
  id: string;
  ruleId: string;
  sensorId: string;
  sensorName: string;
  timestamp: string;
  value: number;
  threshold: number;
  message: string;
  acknowledged: boolean;
}

export interface MQTTConfig {
  broker: string;
  port: number;
  topicPrefix: string;
  protocol: "mqtts" | "wss";
  qos: 0 | 1 | 2;
}

// --- Sensor type metadata ---

export const sensorTypeLabels: Record<SensorType, string> = {
  soil_moisture: "Umidità suolo",
  temperature: "Temperatura",
  humidity: "Umidità aria",
  rain_gauge: "Pluviometro",
  wind: "Anemometro",
  cold_chain: "Catena del freddo",
  irrigation_flow: "Flusso irrigazione",
};

export const sensorTypeUnits: Record<SensorType, string> = {
  soil_moisture: "% VWC",
  temperature: "°C",
  humidity: "%",
  rain_gauge: "mm",
  wind: "km/h",
  cold_chain: "°C",
  irrigation_flow: "L/min",
};

// MQTT topic hierarchy
export const mqttConfig: MQTTConfig = {
  broker: "mqtt.agriromagna.it",
  port: 8883,
  topicPrefix: "agri/",
  protocol: "mqtts",
  qos: 1,
};

export function mqttTopic(farmId: string, fieldId: string, sensorId: string): string {
  return `${mqttConfig.topicPrefix}${farmId}/${fieldId}/${sensorId}/data`;
}

// --- Seed Data ---

export const sensorDevices: SensorDevice[] = [
  {
    id: "sensor-soil-vcs",
    name: "Sonda suolo #1 — Vigna Collina Sud",
    type: "soil_moisture",
    fieldId: "vigna-collina-sud",
    fieldName: "Vigna Collina Sud",
    protocol: "lorawan",
    status: "online",
    batteryPercent: 78,
    lastSeen: "2026-05-13T08:25:00+02:00",
    firmware: "v2.1.4",
  },
  {
    id: "sensor-temp-vcs",
    name: "Termometro aria — Vigna Collina Sud",
    type: "temperature",
    fieldId: "vigna-collina-sud",
    fieldName: "Vigna Collina Sud",
    protocol: "lorawan",
    status: "online",
    batteryPercent: 85,
    lastSeen: "2026-05-13T08:28:00+02:00",
    firmware: "v2.1.4",
  },
  {
    id: "sensor-soil-vae",
    name: "Sonda suolo #2 — Vigna Argine Est",
    type: "soil_moisture",
    fieldId: "vigna-argine-est",
    fieldName: "Vigna Argine Est",
    protocol: "lorawan",
    status: "online",
    batteryPercent: 62,
    lastSeen: "2026-05-13T08:20:00+02:00",
    firmware: "v2.1.3",
  },
  {
    id: "sensor-rain-farm",
    name: "Pluviometro — Stazione aziendale",
    type: "rain_gauge",
    fieldId: "vigna-collina-sud",
    fieldName: "Stazione aziendale",
    protocol: "wifi",
    status: "online",
    batteryPercent: 100,
    lastSeen: "2026-05-13T08:30:00+02:00",
    firmware: "v3.0.1",
  },
  {
    id: "sensor-wind-farm",
    name: "Anemometro — Stazione aziendale",
    type: "wind",
    fieldId: "vigna-collina-sud",
    fieldName: "Stazione aziendale",
    protocol: "wifi",
    status: "online",
    batteryPercent: 100,
    lastSeen: "2026-05-13T08:30:00+02:00",
    firmware: "v3.0.1",
  },
  {
    id: "sensor-cold-chain",
    name: "Sonda frigo — Autocarro RF-218",
    type: "cold_chain",
    fieldId: "vigna-collina-sud",
    fieldName: "Trasporto",
    protocol: "mqtt",
    status: "offline",
    batteryPercent: 45,
    lastSeen: "2026-05-12T16:00:00+02:00",
    firmware: "v1.8.2",
  },
  {
    id: "sensor-flow-fsm",
    name: "Flussimetro irrigazione — Frutteto",
    type: "irrigation_flow",
    fieldId: "frutteto-san-mamante",
    fieldName: "Frutteto San Mamante",
    protocol: "zigbee",
    status: "warning",
    batteryPercent: 18,
    lastSeen: "2026-05-13T07:45:00+02:00",
    firmware: "v1.5.0",
  },
];

// Simulated time-series readings (last 24h for key sensors)
function generateReadings(sensorId: string, baseValue: number, variance: number, unit: string, count = 24): SensorReading[] {
  const now = new Date("2026-05-13T08:30:00+02:00");
  return Array.from({ length: count }, (_, i) => {
    const time = new Date(now.getTime() - (count - 1 - i) * 3600000);
    const cyclic = Math.sin((i / count) * Math.PI * 2) * variance * 0.5;
    const noise = (Math.random() - 0.5) * variance * 0.3;
    return {
      id: `reading-${sensorId}-${i}`,
      sensorId,
      timestamp: time.toISOString(),
      value: +(baseValue + cyclic + noise).toFixed(1),
      unit,
    };
  });
}

export const sensorReadings: SensorReading[] = [
  ...generateReadings("sensor-soil-vcs", 22, 8, "% VWC"),
  ...generateReadings("sensor-temp-vcs", 20, 10, "°C"),
  ...generateReadings("sensor-soil-vae", 19, 6, "% VWC"),
  ...generateReadings("sensor-rain-farm", 0.5, 2, "mm"),
  ...generateReadings("sensor-wind-farm", 12, 8, "km/h"),
  ...generateReadings("sensor-cold-chain", 4, 2, "°C", 12),
  ...generateReadings("sensor-flow-fsm", 2.5, 1.5, "L/min"),
];

export const alertRules: AlertRule[] = [
  {
    id: "rule-soil-low",
    sensorId: "sensor-soil-vcs",
    name: "Suolo secco — Vigna Sud",
    condition: "below",
    threshold: 15,
    unit: "% VWC",
    active: true,
  },
  {
    id: "rule-frost",
    sensorId: "sensor-temp-vcs",
    name: "Rischio gelo — Vigna Sud",
    condition: "below",
    threshold: 2,
    unit: "°C",
    active: true,
  },
  {
    id: "rule-cold-chain",
    sensorId: "sensor-cold-chain",
    name: "Temperatura frigo alta",
    condition: "above",
    threshold: 7,
    unit: "°C",
    active: true,
  },
  {
    id: "rule-wind-high",
    sensorId: "sensor-wind-farm",
    name: "Vento forte — sospendere trattamenti",
    condition: "above",
    threshold: 25,
    unit: "km/h",
    active: true,
  },
];

export const sensorAlerts: SensorAlert[] = [
  {
    id: "salert-1",
    ruleId: "rule-soil-low",
    sensorId: "sensor-soil-vcs",
    sensorName: "Sonda suolo #1",
    timestamp: "2026-05-12T14:30:00+02:00",
    value: 13.8,
    threshold: 15,
    message: "Umidità suolo sotto soglia in Vigna Collina Sud. Irrigazione raccomandata.",
    acknowledged: true,
  },
  {
    id: "salert-2",
    ruleId: "rule-cold-chain",
    sensorId: "sensor-cold-chain",
    sensorName: "Sonda frigo",
    timestamp: "2026-05-12T15:45:00+02:00",
    value: 8.2,
    threshold: 7,
    message: "Temperatura autocarro frigo sopra 7°C. Verificare impianto di refrigerazione.",
    acknowledged: false,
  },
];

// Get latest reading for each sensor
export function getLatestReadings(): Map<string, SensorReading> {
  const latest = new Map<string, SensorReading>();
  for (const r of sensorReadings) {
    const existing = latest.get(r.sensorId);
    if (!existing || r.timestamp > existing.timestamp) {
      latest.set(r.sensorId, r);
    }
  }
  return latest;
}

export const sensorsStore = new InMemoryStore<SensorDevice>();
sensorsStore.seed(sensorDevices.map((s) => ({ ...s })));
