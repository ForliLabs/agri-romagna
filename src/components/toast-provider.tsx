"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, TriangleAlert, Undo2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  onUndo?: () => void;
  /** Progress 0–100 for auto-dismiss countdown */
  progress?: number;
}

interface PushToastOptions {
  title?: string;
  message: string;
  variant: ToastVariant;
  /** Callback invoked when the user clicks "Annulla" (undo). Toast auto-dismiss is paused on hover. */
  onUndo?: () => void;
  /** Duration in ms before auto-dismiss. Defaults to 5000. Set 0 to disable. */
  duration?: number;
}

interface ToastContextValue {
  pushToast: (toast: Omit<ToastItem, "id">) => void;
  pushUndoToast: (options: PushToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantClasses: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  error: "border-rose-200 bg-rose-50 text-rose-950",
  info: "border-sky-200 bg-sky-50 text-sky-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
};

const variantIcons = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info,
  warning: TriangleAlert,
};

const variantProgressColors: Record<ToastVariant, string> = {
  success: "bg-emerald-500",
  error: "bg-rose-500",
  info: "bg-sky-500",
  warning: "bg-amber-500",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutIds = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const progressIntervals = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const hoveredToasts = useRef<Set<string>>(new Set());

  // Cleanup all timers on unmount to prevent memory leaks
  useEffect(() => {
    const timeouts = timeoutIds.current;
    const intervals = progressIntervals.current;
    return () => {
      for (const id of Object.keys(timeouts)) {
        clearTimeout(timeouts[id]);
      }
      for (const id of Object.keys(intervals)) {
        clearInterval(intervals[id]);
      }
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timeoutId = timeoutIds.current[id];
    if (timeoutId) {
      clearTimeout(timeoutId);
      delete timeoutIds.current[id];
    }
    const interval = progressIntervals.current[id];
    if (interval) {
      clearInterval(interval);
      delete progressIntervals.current[id];
    }
    hoveredToasts.current.delete(id);
  }, []);

  const pushToast = useCallback(
    ({ title, message, variant, onUndo }: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, title, message, variant, onUndo }]);
      timeoutIds.current[id] = setTimeout(() => dismissToast(id), 5000);
    },
    [dismissToast]
  );

  const pushUndoToast = useCallback(
    ({ title, message, variant, onUndo, duration = 5000 }: PushToastOptions) => {
      const id = crypto.randomUUID();
      setToasts((current) => [
        ...current,
        { id, title, message, variant, onUndo, progress: 100 },
      ]);

      if (duration > 0) {
        const startTime = Date.now();
        const intervalMs = 50;

        progressIntervals.current[id] = setInterval(() => {
          if (hoveredToasts.current.has(id)) return; // Pause on hover

          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 100 - (elapsed / duration) * 100);

          if (remaining <= 0) {
            dismissToast(id);
          } else {
            setToasts((current) =>
              current.map((t) =>
                t.id === id ? { ...t, progress: remaining } : t
              )
            );
          }
        }, intervalMs);
      }
    },
    [dismissToast]
  );

  const handleMouseEnter = useCallback((id: string) => {
    hoveredToasts.current.add(id);
  }, []);

  const handleMouseLeave = useCallback((id: string) => {
    hoveredToasts.current.delete(id);
  }, []);

  const handleUndo = useCallback(
    (toast: ToastItem) => {
      toast.onUndo?.();
      dismissToast(toast.id);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({ pushToast, pushUndoToast }),
    [pushToast, pushUndoToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] mx-auto flex max-w-md flex-col gap-3 px-4"
      >
        {toasts.map((toast) => {
          const Icon = variantIcons[toast.variant];
          return (
            <div
              key={toast.id}
              role={toast.variant === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto overflow-hidden rounded-2xl border shadow-lg shadow-emerald-950/10 backdrop-blur animate-in-slide-down",
                variantClasses[toast.variant]
              )}
              onMouseEnter={() => handleMouseEnter(toast.id)}
              onMouseLeave={() => handleMouseLeave(toast.id)}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  {toast.title ? (
                    <p className="font-semibold">{toast.title}</p>
                  ) : null}
                  <p className={cn("text-sm", toast.title && "mt-1")}>
                    {toast.message}
                  </p>
                </div>
                {toast.onUndo ? (
                  <button
                    type="button"
                    onClick={() => handleUndo(toast)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-current/15 px-2.5 py-1 text-xs font-semibold transition hover:bg-black/5"
                    aria-label="Annulla azione"
                  >
                    <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Annulla
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-full p-1 text-current/60 transition hover:bg-black/5 hover:text-current"
                  aria-label="Chiudi notifica"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {/* Progress bar for undo toasts */}
              {toast.progress !== undefined ? (
                <div className="h-1 w-full bg-black/5">
                  <div
                    className={cn(
                      "h-full transition-all duration-100 ease-linear",
                      variantProgressColors[toast.variant]
                    )}
                    style={{ width: `${toast.progress}%` }}
                    role="progressbar"
                    aria-valuenow={Math.round(toast.progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
