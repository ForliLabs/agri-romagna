"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  CloudSun,
  Droplets,
  ShieldCheck,
  Bug,
  Tractor,
  Wind,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trapFocus } from "@/lib/focus-management";
import type { AlertCategory, NotificationLog } from "@/lib/notification-service";

const categoryIcons: Record<AlertCategory, React.ElementType> = {
  frost: CloudSun,
  hail: CloudSun,
  flood: Droplets,
  wind: Wind,
  pest: Bug,
  harvest: Tractor,
  compliance: ShieldCheck,
};

const categoryColors: Record<AlertCategory, string> = {
  frost: "bg-sky-100 text-sky-700",
  hail: "bg-slate-100 text-slate-700",
  flood: "bg-blue-100 text-blue-700",
  wind: "bg-amber-100 text-amber-700",
  pest: "bg-red-100 text-red-700",
  harvest: "bg-emerald-100 text-emerald-700",
  compliance: "bg-purple-100 text-purple-700",
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Adesso";
  if (diffMin < 60) return `${diffMin} min fa`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h fa`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}g fa`;
}

interface NotificationCenterProps {
  notifications: NotificationLog[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllRead?: () => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllRead,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      trapFocus(event, panelRef.current);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="relative rounded-full p-2 text-emerald-100 transition hover:bg-emerald-50/10"
        aria-label={`Notifiche${unreadCount > 0 ? ` (${unreadCount} non lette)` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white animate-in-scale">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Centro notifiche"
          className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-2xl shadow-emerald-950/15 animate-in-slide-down dark:border-emerald-50/10 dark:bg-[#162b1e] dark:shadow-black/30 sm:w-96"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-emerald-950/10 bg-[#f7f4ec] px-4 py-3 dark:border-emerald-50/10 dark:bg-[#0c1a12]">
            <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-50">Notifiche</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-50/10"
                >
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Segna tutte lette
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
                className="rounded-full p-1 text-emerald-950/50 transition hover:bg-emerald-100 hover:text-emerald-950 dark:text-emerald-100/50 dark:hover:bg-emerald-50/10 dark:hover:text-emerald-50"
                aria-label="Chiudi notifiche"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-[60vh] overflow-y-auto" role="log" aria-label="Elenco notifiche">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-emerald-950/50 dark:text-emerald-100/50">
                <Bell
                  className="mx-auto h-8 w-8 text-emerald-950/20"
                  aria-hidden="true"
                />
                <p className="mt-2">Nessuna notifica</p>
              </div>
            ) : (
              <ol className="divide-y divide-emerald-950/5 list-none m-0 p-0">
                {notifications.map((notif) => {
                  const Icon = categoryIcons[notif.category] ?? Bell;
                  const colorClass =
                    categoryColors[notif.category] ??
                    "bg-emerald-100 text-emerald-700";

                  return (
                    <li
                      key={notif.id}
                      className={cn(
                        "group flex gap-3 px-4 py-3 transition hover:bg-emerald-50/50 dark:hover:bg-emerald-50/5",
                        !notif.read && "bg-emerald-50/30 dark:bg-emerald-50/5"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                          colorClass
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm leading-tight",
                              notif.read
                                ? "text-emerald-950/70 dark:text-emerald-100/70"
                                : "font-semibold text-emerald-950 dark:text-emerald-50"
                            )}
                          >
                            {!notif.read && <span className="sr-only">Non letta: </span>}
                            {notif.title}
                          </p>
                          {!notif.read ? (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-emerald-950/55 dark:text-emerald-100/55">
                          {notif.message}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <time dateTime={notif.sentAt} className="text-[10px] uppercase tracking-wider text-emerald-950/40 dark:text-emerald-100/40">
                            {formatRelativeTime(notif.sentAt)}
                          </time>
                          {!notif.read && onMarkAsRead ? (
                            <button
                              type="button"
                              onClick={() => onMarkAsRead(notif.id)}
                              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 transition hover:bg-emerald-100 focus-visible:bg-emerald-100"
                              aria-label={`Segna come letta: ${notif.title}`}
                            >
                              <Check className="h-3 w-3" aria-hidden="true" />
                              Letto
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Export formatRelativeTime for testing
export { formatRelativeTime };
