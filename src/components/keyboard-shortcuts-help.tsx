"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { X } from "lucide-react";
import {
  shortcutRegistry,
  formatShortcutKeys,
  type ShortcutRegistration,
} from "@/lib/keyboard-shortcuts";
import { cn } from "@/lib/utils";
import { trapFocus, focusFirstElement } from "@/lib/focus-management";

/**
 * Hook to register a keyboard shortcut for a component's lifetime.
 */
export function useKeyboardShortcut(shortcut: ShortcutRegistration) {
  useEffect(() => {
    return shortcutRegistry.register(shortcut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcut.id, shortcut.keys]);
}

/**
 * Hook to register multiple keyboard shortcuts at once.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutRegistration[]) {
  useEffect(() => {
    const unsubscribes = shortcuts.map((s) => shortcutRegistry.register(s));
    return () => unsubscribes.forEach((unsub) => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcuts.length]);
}

/**
 * Keyboard shortcuts help overlay, toggled with "?" key.
 */
export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const toggleHelp = useCallback(() => setOpen((prev) => !prev), []);

  useKeyboardShortcut({
    id: "shortcuts-help",
    keys: "?",
    label: "?",
    description: "Mostra scorciatoie da tastiera",
    section: "Generale",
    handler: toggleHelp,
  });

  useEffect(() => {
    if (!open) return;

    requestAnimationFrame(() => focusFirstElement(dialogRef.current));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      trapFocus(e, dialogRef.current);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  const groups = shortcutRegistry.getGrouped();

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="presentation"
      onClick={() => setOpen(false)}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-help-title"
        className="mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-2xl dark:border-emerald-50/10 dark:bg-[#162b1e]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-emerald-950/10 pb-4 dark:border-emerald-50/10">
          <h2
            id="shortcuts-help-title"
            className="text-lg font-bold text-emerald-950 dark:text-emerald-50"
          >
            Scorciatoie da tastiera
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-2 text-emerald-950/60 transition hover:bg-emerald-100 hover:text-emerald-950 dark:text-emerald-100/60 dark:hover:bg-emerald-50/10 dark:hover:text-emerald-50"
            aria-label="Chiudi"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 space-y-6">
          {Object.entries(groups).map(([section, shortcuts]) => (
            <div key={section}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                {section}
              </p>
              <div className="space-y-1">
                {shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between gap-4 rounded-xl px-3 py-2 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-50/5"
                  >
                    <span className="text-emerald-950/75 dark:text-emerald-100/75">
                      {shortcut.description}
                    </span>
                    <kbd className="shrink-0 rounded-lg border border-emerald-950/15 bg-[#f7f4ec] px-2 py-1 font-mono text-xs font-semibold text-emerald-950/80 dark:border-emerald-50/15 dark:bg-[#0c1a12] dark:text-emerald-100/80">
                      {formatShortcutKeys(shortcut.keys)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
