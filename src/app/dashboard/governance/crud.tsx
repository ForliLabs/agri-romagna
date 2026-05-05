"use client";

import { useState, useCallback } from "react";
import { Vote } from "lucide-react";
import { CrudDialog, CrudActionBar, CrudPanel } from "@/components/crud-dialog";

const proposalFormFields = [
  { name: "title", label: "Titolo proposta", type: "text" as const, required: true, placeholder: "Es. Piano irrigazione estate 2026" },
  { name: "description", label: "Descrizione", type: "textarea" as const, required: true, placeholder: "Descrizione dettagliata della proposta..." },
  { name: "proposedBy", label: "Proponente", type: "text" as const, required: true, placeholder: "Es. Marco Tondini" },
  { name: "category", label: "Categoria", type: "select" as const, options: [
    { value: "operational", label: "Operativa" },
    { value: "financial", label: "Finanziaria" },
    { value: "regulatory", label: "Regolatoria" },
    { value: "strategic", label: "Strategica" },
  ]},
  { name: "status", label: "Stato iniziale", type: "select" as const, options: [
    { value: "draft", label: "Bozza" },
    { value: "open", label: "Aperta" },
  ]},
  { name: "votingDeadline", label: "Scadenza voto", type: "date" as const },
];

export function GovernanceCrud() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreate = useCallback(async (data: Record<string, string | number>) => {
    const response = await fetch("/api/governance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Errore di rete" }));
      throw new Error(error.error ?? "Errore durante la creazione della proposta.");
    }

    setSuccessMessage("Proposta creata con successo.");
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  return (
    <>
      <CrudPanel
        title="Nuova proposta"
        subtitle="Inserisci una proposta per la prossima deliberazione cooperativa"
        icon={<Vote className="h-6 w-6" aria-hidden="true" />}
        actionBar={<CrudActionBar onAdd={() => setDialogOpen(true)} addLabel="Nuova proposta" />}
      >
        {successMessage && (
          <div role="alert" className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        )}
        <p className="text-sm text-emerald-950/65">
          Crea proposte operative, finanziarie, regolamentari o strategiche che saranno votate dai soci cooperativi.
        </p>
      </CrudPanel>
      <CrudDialog
        title="Nuova proposta"
        fields={proposalFormFields}
        onSubmit={handleCreate}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        submitLabel="Crea proposta"
      />
    </>
  );
}
