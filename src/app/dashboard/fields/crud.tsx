"use client";

import { useState, useCallback } from "react";
import { Trees } from "lucide-react";
import { CrudDialog, CrudActionBar, CrudPanel } from "@/components/crud-dialog";

const fieldFormFields = [
  { name: "name", label: "Nome campo", type: "text" as const, required: true, placeholder: "Es. Vigna Collina Nord" },
  { name: "crop", label: "Coltura", type: "text" as const, required: true, placeholder: "Es. Sangiovese" },
  { name: "areaHa", label: "Area (ha)", type: "number" as const, required: true, placeholder: "Es. 3.5" },
  { name: "status", label: "Stato", type: "select" as const, required: true, options: [
    { value: "attivo", label: "Attivo" },
    { value: "in preparazione", label: "In preparazione" },
    { value: "raccolta imminente", label: "Raccolta imminente" },
    { value: "a riposo", label: "A riposo" },
  ]},
  { name: "plantingDate", label: "Data impianto", type: "date" as const, required: true },
  { name: "municipality", label: "Comune", type: "text" as const, placeholder: "Es. Bertinoro" },
  { name: "irrigation", label: "Irrigazione", type: "text" as const, placeholder: "Es. A goccia" },
  { name: "notes", label: "Note", type: "textarea" as const, placeholder: "Note operative..." },
];

export function FieldsCrud() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreate = useCallback(async (data: Record<string, string | number>) => {
    const response = await fetch("/api/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Errore di rete" }));
      throw new Error(error.detail ?? "Errore durante la creazione del campo.");
    }

    setSuccessMessage("Campo creato con successo.");
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  return (
    <>
      <CrudPanel
        title="Gestione campi"
        subtitle="Aggiungi nuovi appezzamenti al catasto operativo"
        icon={<Trees className="h-6 w-6" aria-hidden="true" />}
        actionBar={<CrudActionBar onAdd={() => setDialogOpen(true)} addLabel="Nuovo campo" />}
      >
        {successMessage && (
          <div role="alert" className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        )}
        <p className="text-sm text-emerald-950/65">
          Usa il pulsante &quot;Nuovo campo&quot; per registrare un appezzamento via API. I dati verranno salvati nel database.
        </p>
      </CrudPanel>
      <CrudDialog
        title="Nuovo campo"
        fields={fieldFormFields}
        onSubmit={handleCreate}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        submitLabel="Crea campo"
      />
    </>
  );
}
