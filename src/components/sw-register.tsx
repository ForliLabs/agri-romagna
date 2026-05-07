"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, X } from "lucide-react";

export function ServiceWorkerRegistration() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Check for waiting worker on initial load
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdatePrompt(true);
        }

        // Listen for new service worker installing
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setShowUpdatePrompt(true);
            }
          });
        });
      })
      .catch((err) => console.warn("SW registration failed:", err));

    // Reload when the new SW takes over
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
    setShowUpdatePrompt(false);
  }, [waitingWorker]);

  const handleDismiss = useCallback(() => {
    setShowUpdatePrompt(false);
  }, []);

  if (!showUpdatePrompt) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm animate-in-slide-up rounded-2xl border border-emerald-950/10 bg-white p-4 shadow-xl dark:border-emerald-50/10 dark:bg-[#162b1e]"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
          <RefreshCw className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-50">
            Aggiornamento disponibile
          </p>
          <p className="mt-0.5 text-xs text-emerald-950/60 dark:text-emerald-100/60">
            Una nuova versione è pronta. Aggiorna per le ultime funzionalità.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleUpdate}
              className="rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              Aggiorna ora
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-950/60 transition hover:bg-emerald-50 dark:text-emerald-100/60 dark:hover:bg-emerald-50/5"
            >
              Dopo
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-full p-1 text-emerald-950/40 transition hover:text-emerald-950 dark:text-emerald-100/40 dark:hover:text-emerald-50"
          aria-label="Chiudi"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
