"use client";

import { useCallback, useEffect, useState } from "react";
import { Cloud, CloudOff, RefreshCw, Check, AlertTriangle } from "lucide-react";

type SyncStatus = "online" | "offline" | "syncing" | "error";

interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  lastSync: string | null;
}

/**
 * Displays connectivity and sync status with pending mutation count.
 * Triggers background sync when connectivity returns.
 */
export function SyncStatusIndicator() {
  const [state, setState] = useState<SyncState>({
    status: "online",
    pendingCount: 0,
    lastSync: null,
  });

  const checkStatus = useCallback(async () => {
    const isOnline = navigator.onLine;

    if (!isOnline) {
      setState((prev) => ({ ...prev, status: "offline" }));
      return;
    }

    try {
      // Dynamically import to avoid SSR issues with IndexedDB
      const { SyncQueue, OfflineMetadata } = await import("@/lib/offline-store");
      const pendingCount = await SyncQueue.count();
      const lastSync = await OfflineMetadata.getLastSync();

      if (pendingCount > 0) {
        setState({
          status: "syncing",
          pendingCount,
          lastSync: lastSync?.toISOString() ?? null,
        });

        const result = await SyncQueue.processPending();
        if (result.failed > 0) {
          setState((prev) => ({
            ...prev,
            status: "error",
            pendingCount: result.failed,
          }));
        } else {
          await OfflineMetadata.setLastSync();
          setState({
            status: "online",
            pendingCount: 0,
            lastSync: new Date().toISOString(),
          });
        }
      } else {
        setState({
          status: "online",
          pendingCount: 0,
          lastSync: lastSync?.toISOString() ?? null,
        });
      }
    } catch {
      setState((prev) => ({ ...prev, status: isOnline ? "online" : "offline" }));
    }
  }, []);

  useEffect(() => {
    checkStatus();

    const handleOnline = () => checkStatus();
    const handleOffline = () =>
      setState((prev) => ({ ...prev, status: "offline" }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic check every 30 seconds
    const interval = setInterval(checkStatus, 30_000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [checkStatus]);

  const icon = {
    online: <Cloud className="h-4 w-4" />,
    offline: <CloudOff className="h-4 w-4" />,
    syncing: <RefreshCw className="h-4 w-4 animate-spin" />,
    error: <AlertTriangle className="h-4 w-4" />,
  }[state.status];

  const label = {
    online: "Connesso",
    offline: "Offline",
    syncing: `Sincronizzazione (${state.pendingCount})…`,
    error: `${state.pendingCount} non sincronizzati`,
  }[state.status];

  const colorClasses = {
    online: "bg-emerald-50 text-emerald-700",
    offline: "bg-amber-50 text-amber-700",
    syncing: "bg-sky-50 text-sky-700",
    error: "bg-rose-50 text-rose-700",
  }[state.status];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${colorClasses}`}
      role="status"
      aria-live="polite"
    >
      {icon}
      <span>{label}</span>
      {state.status === "online" && state.lastSync && (
        <>
          <Check className="h-3 w-3 text-emerald-500" aria-hidden="true" />
          <span className="sr-only">Sincronizzato</span>
        </>
      )}
    </div>
  );
}
