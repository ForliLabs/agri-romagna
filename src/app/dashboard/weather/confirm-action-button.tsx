"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ConfirmActionButtonProps {
  workflow: string;
  recommendedDay: string;
  recommendation: string;
}

export function ConfirmActionButton({
  workflow,
  recommendedDay,
  recommendation,
}: ConfirmActionButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleConfirm() {
    setState("loading");
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ workflow, recommendedDay, recommendation }),
      });
      if (res.ok) {
        setState("done");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <span
        role="status"
        aria-live="polite"
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
      >
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Confermata
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={state === "loading"}
        aria-busy={state === "loading"}
        aria-label={`Conferma azione: ${workflow}`}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {state === "loading" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        Conferma azione
      </button>
      {state === "error" && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-rose-700">
          Conferma non riuscita — riprova.
        </p>
      )}
    </div>
  );
}
