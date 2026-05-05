"use client";

import { useState, useCallback } from "react";
import { Radio } from "lucide-react";
import { CrudDialog, CrudActionBar, CrudPanel } from "@/components/crud-dialog";

const sensorFormFields = [
  { name: "name", label: "Nome sensore", type: "text" as const, required: true, placeholder: "Es. Sonda suolo #3" },
  { name: "type", label: "Tipo", type: "select" as const, required: true, options: [
    { value: "soil_moisture", label: "Umidità suolo" },
    { value: "temperature", label: "Temperatura" },
    { value: "humidity", label: "Umidità aria" },
    { value: "rain_gauge", label: "Pluviometro" },
    { value: "wind", label: "Anemometro" },
    { value: "cold_chain", label: "Catena del freddo" },
    { value: "irrigation_flow", label: "Flusso irrigazione" },
  ]},
  { name: "fieldId", label: "ID campo", type: "text" as const, required: true, placeholder: "Es. vigna-collina-sud" },
  { name: "fieldName", label: "Nome campo", type: "text" as const, required: true, placeholder: "Es. Vigna Collina Sud" },
  { name: "protocol", label: "Protocollo", type: "select" as const, options: [
    { value: "lorawan", label: "LoRaWAN" },
    { value: "mqtt", label: "MQTT" },
    { value: "wifi", label: "WiFi" },
    { value: "zigbee", label: "Zigbee" },
  ]},
  { name: "firmware", label: "Firmware", type: "text" as const, placeholder: "Es. v2.1.4" },
];

export function IoTCrud() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreate = useCallback(async (data: Record<string, string | number>) => {
    const response = await fetch("/api/iot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register-sensor",
        sensor: data,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Errore di rete" }));
      throw new Error(error.detail ?? "Errore durante la registrazione del sensore.");
    }

    setSuccessMessage("Sensore registrato con successo.");
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  return (
    <>
      <CrudPanel
        title="Registra sensore"
        subtitle="Aggiungi un nuovo dispositivo IoT alla rete di monitoraggio"
        icon={<Radio className="h-6 w-6" aria-hidden="true" />}
        actionBar={<CrudActionBar onAdd={() => setDialogOpen(true)} addLabel="Nuovo sensore" />}
      >
        {successMessage && (
          <div role="alert" className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        )}
        <p className="text-sm text-emerald-950/65">
          Registra sensori LoRaWAN, MQTT, WiFi o Zigbee. Il sensore riceverà un topic MQTT e sarà immediatamente visibile nel pannello.
        </p>
      </CrudPanel>
      <CrudDialog
        title="Nuovo sensore"
        fields={sensorFormFields}
        onSubmit={handleCreate}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        submitLabel="Registra sensore"
      />
    </>
  );
}
