import {
  Wifi,
  WifiOff,
  AlertTriangle,
  Battery,
  Radio,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Activity,
  Bell,
  Settings,
} from "lucide-react";
import {
  sensorDevices,
  sensorReadings,
  alertRules,
  sensorAlerts,
  mqttConfig,
  getLatestReadings,
  sensorTypeLabels,
  sensorTypeUnits,
} from "@/lib/iot-data";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const latestReadings = getLatestReadings();
const onlineSensors = sensorDevices.filter((s) => s.status === "online").length;
const warningSensors = sensorDevices.filter((s) => s.status === "warning" || s.status === "error").length;
const unacknowledgedAlerts = sensorAlerts.filter((a) => !a.acknowledged).length;

const statusClasses: Record<string, string> = {
  online: "bg-emerald-50 text-emerald-800",
  offline: "bg-gray-100 text-gray-600",
  warning: "bg-amber-100 text-amber-800",
  error: "bg-rose-100 text-rose-700",
};

const sensorIcons: Record<string, typeof Thermometer> = {
  soil_moisture: Droplets,
  temperature: Thermometer,
  humidity: Droplets,
  rain_gauge: CloudRain,
  wind: Wind,
  cold_chain: Thermometer,
  irrigation_flow: Activity,
};

export default function IoTPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Hub sensori IoT
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Monitoraggio in tempo reale dal campo.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Sensori di suolo, stazioni meteo, catena del freddo e irrigazione connessi via
          MQTT/LoRaWAN. Dati in tempo reale con regole di allerta automatiche.
        </p>
      </section>

      {/* Summary */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Wifi className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-sm text-emerald-950/60">Sensori online</p>
              <p className="mt-1 text-2xl font-bold text-emerald-950">
                {onlineSensors}/{sensorDevices.length}
              </p>
            </div>
          </div>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <div>
              <p className="text-sm text-emerald-950/60">Attenzione</p>
              <p className="mt-1 text-2xl font-bold text-emerald-950">{warningSensors}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-amber-700 font-medium">Batteria bassa o errore</p>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-rose-600" />
            <div>
              <p className="text-sm text-emerald-950/60">Allerte attive</p>
              <p className="mt-1 text-2xl font-bold text-emerald-950">{unacknowledgedAlerts}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-rose-700 font-medium">Da confermare</p>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Radio className="h-6 w-6 text-emerald-700" />
            <div>
              <p className="text-sm text-emerald-950/60">Protocollo</p>
              <p className="mt-1 text-2xl font-bold text-emerald-950">MQTT</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-emerald-950/50">
            {mqttConfig.broker}:{mqttConfig.port}
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Sensor grid */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Letture in tempo reale</h2>
              <p className="text-sm text-emerald-950/65">Ultimo valore per sensore</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {sensorDevices.map((sensor) => {
              const reading = latestReadings.get(sensor.id);
              const IconComp = sensorIcons[sensor.type] ?? Activity;
              return (
                <article key={sensor.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl bg-white p-2 shadow-sm">
                        <IconComp className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-950">
                          {sensorTypeLabels[sensor.type]}
                        </p>
                        <p className="text-xs text-emerald-950/50">{sensor.fieldName}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses[sensor.status]}`}>
                      {sensor.status === "online" ? (
                        <Wifi className="mr-0.5 inline h-3 w-3" />
                      ) : (
                        <WifiOff className="mr-0.5 inline h-3 w-3" />
                      )}
                      {sensor.status}
                    </span>
                  </div>

                  {reading && (
                    <div className="mt-3">
                      <p className="text-3xl font-bold text-emerald-950">
                        {reading.value}
                        <span className="ml-1 text-base font-normal text-emerald-950/50">
                          {reading.unit}
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-emerald-950/45">
                    <span className="flex items-center gap-1">
                      <Battery className="h-3 w-3" />
                      {sensor.batteryPercent}%
                    </span>
                    <span>{dateFormatter.format(new Date(sensor.lastSeen))}</span>
                  </div>

                  {/* Mini sparkline */}
                  {reading && (
                    <div className="mt-3 flex items-end gap-0.5 h-8">
                      {sensorReadings
                        .filter((r) => r.sensorId === sensor.id)
                        .slice(-12)
                        .map((r, i) => {
                          const readings = sensorReadings.filter((sr) => sr.sensorId === sensor.id);
                          const values = readings.map((sr) => sr.value);
                          const min = Math.min(...values);
                          const max = Math.max(...values);
                          const range = max - min || 1;
                          const height = ((r.value - min) / range) * 28 + 4;
                          return (
                            <div
                              key={i}
                              className="flex-1 rounded-t bg-emerald-400/60"
                              style={{ height: `${height}px` }}
                            />
                          );
                        })}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </article>

        {/* Alerts + Rules */}
        <div className="space-y-6">
          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Allerte sensori</h2>
                <p className="text-sm text-emerald-950/65">Soglie superate</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {sensorAlerts.map((alert) => (
                <article key={alert.id} className={`rounded-2xl border p-4 ${
                  alert.acknowledged
                    ? "border-emerald-950/10 bg-[#f7f4ec]"
                    : "border-rose-200 bg-rose-50"
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-emerald-950">{alert.sensorName}</p>
                      <p className="mt-1 text-sm text-emerald-950/70">{alert.message}</p>
                    </div>
                    {!alert.acknowledged && (
                      <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                        Nuova
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-emerald-950/50">
                    <span>Valore: {alert.value} (soglia: {alert.threshold})</span>
                    <span>{dateFormatter.format(new Date(alert.timestamp))}</span>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Regole di allerta</h2>
                <p className="text-sm text-emerald-950/65">Soglie configurate</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {alertRules.map((rule) => {
                const sensor = sensorDevices.find((s) => s.id === rule.sensorId);
                return (
                  <div key={rule.id} className="flex items-center justify-between rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                    <div>
                      <p className="font-semibold text-emerald-950">{rule.name}</p>
                      <p className="mt-1 text-xs text-emerald-950/55">
                        {sensor?.name} · {rule.condition === "above" ? "Sopra" : "Sotto"} {rule.threshold} {rule.unit}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      rule.active ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {rule.active ? "Attiva" : "Disattiva"}
                    </span>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
