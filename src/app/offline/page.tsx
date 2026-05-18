"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { WifiOff, Wifi, RefreshCw, Home } from "lucide-react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator !== "undefined" && navigator.onLine,
  );
  const [retrying, setRetrying] = useState(false);
  const [autoRetryCount, setAutoRetryCount] = useState(0);

  const checkConnection = useCallback(async () => {
    setRetrying(true);
    try {
      const res = await fetch("/", { method: "HEAD", cache: "no-store" });
      if (res.ok) {
        setIsOnline(true);
      }
    } catch {
      // still offline
    } finally {
      setRetrying(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Auto-retry every 15s up to 20 times
    const interval = setInterval(() => {
      setAutoRetryCount((prev) => {
        if (prev >= 20) return prev;
        checkConnection();
        return prev + 1;
      });
    }, 15_000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [checkConnection]);

  // Redirect when back online
  useEffect(() => {
    if (isOnline) {
      const timeout = setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isOnline]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        {/* Status icon */}
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full transition-colors duration-500 ${
            isOnline
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {isOnline ? (
            <Wifi className="h-10 w-10" aria-hidden="true" />
          ) : (
            <WifiOff className="h-10 w-10" aria-hidden="true" />
          )}
        </div>

        {isOnline ? (
          <>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-emerald-950">
              Connessione ripristinata
            </h1>
            <p className="mt-4 text-base leading-7 text-emerald-950/70">
              La connessione è tornata. Reindirizzamento al dashboard in
              corso…
            </p>
            <div className="mt-6">
              <div className="mx-auto h-1.5 w-48 overflow-hidden rounded-full bg-emerald-100">
                <div className="h-full animate-pulse rounded-full bg-emerald-600" style={{ width: "100%" }} />
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-emerald-950">
              Sei offline
            </h1>
            <p className="mt-4 text-base leading-7 text-emerald-950/70">
              La connessione non è disponibile. I dati salvati localmente sono
              ancora accessibili e le modifiche saranno sincronizzate
              automaticamente al ripristino della rete.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={checkConnection}
                disabled={retrying}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
                {retrying ? "Verifica in corso…" : "Riprova connessione"}
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-950/15 px-6 py-3 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-50"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                Torna alla home
              </Link>
            </div>

            {/* Auto-retry status indicator */}
            <p className="mt-8 text-xs text-emerald-950/50">
              {autoRetryCount >= 20
                ? "Verifica automatica sospesa. Usa il pulsante per riprovare manualmente."
                : "AgriRomagna verifica la connessione automaticamente ogni 15 secondi."}
            </p>
            <p className="mt-2 text-xs text-emerald-950/40">
              Le operazioni in campo restano disponibili offline. Le modifiche
              pendenti verranno inviate con la sincronizzazione in background.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
