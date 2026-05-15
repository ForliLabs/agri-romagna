"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKeyboardShortcut } from "@/components/keyboard-shortcuts-help";

export interface CommandPaletteItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  section: string;
  keywords?: string[];
  priority?: boolean;
}

interface CommandPaletteProps {
  items: CommandPaletteItem[];
}

function fuzzyMatch(text: string, query: string): boolean {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return true;
  if (normalizedText.includes(normalizedQuery)) return true;

  // Simple fuzzy: every character of query appears in order in text
  let textIndex = 0;
  for (let i = 0; i < normalizedQuery.length; i++) {
    const char = normalizedQuery[i];
    const found = normalizedText.indexOf(char, textIndex);
    if (found === -1) return false;
    textIndex = found + 1;
  }
  return true;
}

function scoreMatch(item: CommandPaletteItem, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return item.priority ? 1 : 0;

  let score = 0;
  const label = item.label.toLowerCase();

  // Exact match in label
  if (label === q) score += 100;
  // Starts with query
  else if (label.startsWith(q)) score += 50;
  // Contains query
  else if (label.includes(q)) score += 30;

  // Keyword match
  if (item.keywords?.some((k) => k.toLowerCase().includes(q))) score += 20;

  // Section match
  if (item.section.toLowerCase().includes(q)) score += 10;

  // Priority boost
  if (item.priority) score += 5;

  return score;
}

export function CommandPalette({ items }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        triggerRef.current = document.activeElement;
        setQuery("");
        setSelectedIndex(0);
      }
      return !prev;
    });
  }, []);

  useKeyboardShortcut({
    id: "command-palette",
    keys: "mod+k",
    label: "⌘K",
    description: "Apri palette comandi",
    section: "Navigazione",
    handler: toggle,
    global: true,
  });

  const filtered = useMemo(() => {
    const searchText = query.trim().toLowerCase();
    if (!searchText) return items;

    return items
      .filter((item) => {
        const haystack = [
          item.label,
          item.section,
          ...(item.keywords ?? []),
        ].join(" ");
        return fuzzyMatch(haystack, searchText);
      })
      .sort((a, b) => scoreMatch(b, query) - scoreMatch(a, query));
  }, [items, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandPaletteItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.section]) groups[item.section] = [];
      groups[item.section].push(item);
    }
    return groups;
  }, [filtered]);

  const flatFiltered = useMemo(() => {
    const result: CommandPaletteItem[] = [];
    for (const items of Object.values(grouped)) {
      result.push(...items);
    }
    return result;
  }, [grouped]);

  useEffect(() => {
    if (open) {
      // Small delay for DOM to render before focusing
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector("[data-selected='true']");
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const closePalette = useCallback(() => {
    setOpen(false);
    if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
    }
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent | React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          event.preventDefault();
          if (flatFiltered[selectedIndex]) {
            navigateTo(flatFiltered[selectedIndex].href);
          }
          break;
        case "Escape":
          event.preventDefault();
          closePalette();
          break;
      }
    },
    [flatFiltered, selectedIndex, navigateTo, closePalette]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh]"
      role="presentation"
      onClick={() => closePalette()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in-fade" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Palette comandi — cerca tra i moduli"
        className="relative z-10 mx-4 w-full max-w-xl animate-in-scale overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-2xl shadow-emerald-950/20"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-emerald-950/10 px-4 py-3">
          <Search
            className="h-5 w-5 shrink-0 text-emerald-950/40"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Cerca moduli, flussi, analytics…"
            className="min-w-0 flex-1 bg-transparent text-sm text-emerald-950 outline-none placeholder:text-emerald-950/40"
            aria-label="Cerca moduli"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls="command-palette-list"
            aria-activedescendant={
              flatFiltered[selectedIndex]
                ? `cp-item-${flatFiltered[selectedIndex].id}`
                : undefined
            }
          />
          <kbd className="hidden shrink-0 rounded-lg border border-emerald-950/10 bg-[#f7f4ec] px-2 py-0.5 font-mono text-xs text-emerald-950/50 sm:inline-block">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="command-palette-list"
          role="listbox"
          className="max-h-[50vh] overflow-y-auto px-2 py-2"
        >
          {flatFiltered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-emerald-950/50">
              Nessun modulo trovato per &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(grouped).map(([section, sectionItems]) => (
              <div key={section}>
                <p className="mb-1 mt-2 px-3 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-950/45">
                  {section}
                </p>
                {sectionItems.map((item) => {
                  const globalIndex = flatFiltered.indexOf(item);
                  const isSelected = globalIndex === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      id={`cp-item-${item.id}`}
                      role="option"
                      aria-selected={isSelected}
                      data-selected={isSelected}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-emerald-100 text-emerald-950"
                          : "text-emerald-950/75 hover:bg-emerald-50"
                      )}
                      onClick={() => navigateTo(item.href)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      {item.icon ? (
                        <span className="h-5 w-5 shrink-0" aria-hidden="true">
                          {item.icon}
                        </span>
                      ) : null}
                      <span className="min-w-0 flex-1 font-medium">
                        {item.label}
                      </span>
                      {isSelected ? (
                        <CornerDownLeft
                          className="h-4 w-4 shrink-0 text-emerald-600"
                          aria-hidden="true"
                        />
                      ) : (
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-emerald-950/25"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-emerald-950/10 bg-[#f7f4ec] px-4 py-2 text-xs text-emerald-950/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-emerald-950/10 bg-white px-1.5 py-0.5 font-mono">
                ↑↓
              </kbd>
              naviga
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-emerald-950/10 bg-white px-1.5 py-0.5 font-mono">
                ↩
              </kbd>
              apri
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-emerald-950/10 bg-white px-1.5 py-0.5 font-mono">
                Esc
              </kbd>
              chiudi
            </span>
          </div>
          <span>{flatFiltered.length} moduli</span>
        </div>
      </div>
    </div>
  );
}

// Re-export fuzzyMatch and scoreMatch for testing
export { fuzzyMatch, scoreMatch };
