"use client";

import { useState, useMemo, useId, useRef, useEffect, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  getValue?: (row: T) => string | number;
  className?: string;
  /** If true, this column is always shown in mobile card view */
  primary?: boolean;
  /** If true, this column is hidden in mobile card view */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  pageSize?: number;
  className?: string;
  /** Render as cards on mobile instead of horizontal scroll table. Defaults to true. */
  mobileCards?: boolean;
  /** Accessible caption / programmatic name for the table */
  caption?: string;
}

type SortDirection = "asc" | "desc" | null;

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  searchable = false,
  searchPlaceholder = "Cerca…",
  emptyMessage = "Nessun dato disponibile.",
  pageSize = 10,
  className,
  mobileCards = true,
  caption,
}: DataTableProps<T>) {
  const tableId = useId();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(0);
  // Debounced announcement for screen readers — only after user stops typing
  const [announcement, setAnnouncement] = useState("");
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevAnnouncementRef = useRef("");

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.trim().toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const value = col.getValue ? col.getValue(row) : row[col.key];
        return String(value ?? "").toLowerCase().includes(q);
      })
    );
  }, [data, query, columns]);

  // Debounce live-region announcements to avoid chatty updates while typing
  useEffect(() => {
    if (announceTimerRef.current) clearTimeout(announceTimerRef.current);
    if (!searchable || !query.trim()) {
      prevAnnouncementRef.current = "";
      return;
    }
    const count = filtered.length;
    announceTimerRef.current = setTimeout(() => {
      const msg = `${count} risultati trovati`;
      if (msg !== prevAnnouncementRef.current) {
        prevAnnouncementRef.current = msg;
        setAnnouncement(msg);
      }
    }, 500);
    return () => {
      if (announceTimerRef.current) clearTimeout(announceTimerRef.current);
    };
  }, [filtered.length, query, searchable]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = col.getValue ? col.getValue(a) : (a[col.key] as string | number);
      const bVal = col.getValue ? col.getValue(b) : (b[col.key] as string | number);
      const cmp = typeof aVal === "number" && typeof bVal === "number"
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal), "it-IT");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePageIndex = Math.min(page, totalPages - 1);
  const paged = sorted.slice(safePageIndex * pageSize, (safePageIndex + 1) * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  function sortLabel(colKey: string, header: string): string {
    if (sortKey !== colKey) return `Ordina per ${header}`;
    return sortDir === "asc"
      ? `Ordinato per ${header} crescente, attiva per decrescente`
      : `Ordinato per ${header} decrescente, attiva per rimuovere ordinamento`;
  }

  function SortIcon({ colKey }: { colKey: string }) {
    if (sortKey !== colKey) return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-emerald-950/30" />;
    return sortDir === "asc"
      ? <ChevronUp className="ml-1 inline h-3.5 w-3.5 text-emerald-700" />
      : <ChevronDown className="ml-1 inline h-3.5 w-3.5 text-emerald-700" />;
  }

  // Identify primary columns for mobile card view
  const primaryColumns = columns.filter((col) => col.primary);
  const secondaryColumns = columns.filter(
    (col) => !col.primary && !col.hideOnMobile
  );

  return (
    <div className={cn("overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5", className)}>
      {searchable && (
        <div className="border-b border-emerald-950/10 px-6 py-4">
          <label className="relative block max-w-sm">
            <span className="sr-only">{searchPlaceholder}</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-950/40" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-emerald-950/10 bg-[#f7f4ec] py-2 pl-10 pr-4 text-sm text-emerald-950 placeholder:text-emerald-950/40"
            />
          </label>
        </div>
      )}

      {/* Live region for result count — debounced to reduce chatter */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Mobile card view */}
      {mobileCards ? (
        <div className="block md:hidden">
          {paged.length === 0 ? (
            <div className="px-6 py-8 text-center text-emerald-950/55">
              {emptyMessage}
            </div>
          ) : (
            <div className="divide-y divide-emerald-950/10">
              {paged.map((row) => (
                <MobileCard
                  key={String(row[keyField])}
                  row={row}
                  primaryColumns={primaryColumns.length > 0 ? primaryColumns : columns.slice(0, 2)}
                  secondaryColumns={secondaryColumns.length > 0 ? secondaryColumns : columns.slice(2)}
                  tableId={tableId}
                  rowKey={String(row[keyField])}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Desktop table view */}
      <div className={cn("overflow-x-auto", mobileCards && "hidden md:block")}>
        <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
          {caption ? (
            <caption className="sr-only">{caption}</caption>
          ) : null}
          <thead className="bg-[#f7f4ec] text-emerald-950/65">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-6 py-4 font-semibold", col.className)}
                  aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-0.5 cursor-pointer select-none bg-transparent border-0 p-0 font-semibold text-emerald-950/65 hover:text-emerald-700 transition-colors"
                      onClick={() => handleSort(col.key)}
                      aria-label={sortLabel(col.key, col.header)}
                    >
                      {col.header}
                      <SortIcon colKey={col.key} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-950/10 bg-white">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-emerald-950/55">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr key={String(row[keyField])} className="animate-in-fade">
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-6 py-4 text-emerald-950/75", col.className)}>
                      {col.render ? col.render(row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-emerald-950/10 px-6 py-3 text-sm text-emerald-950/65">
          <span>
            Pagina {safePageIndex + 1} di {totalPages} · {sorted.length} risultati
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(0, safePageIndex - 1))}
              disabled={safePageIndex === 0}
              className="rounded-lg border border-emerald-950/10 px-3 py-1 text-sm font-medium transition hover:bg-emerald-50 disabled:opacity-40"
            >
              Precedente
            </button>
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages - 1, safePageIndex + 1))}
              disabled={safePageIndex >= totalPages - 1}
              className="rounded-lg border border-emerald-950/10 px-3 py-1 text-sm font-medium transition hover:bg-emerald-50 disabled:opacity-40"
            >
              Successiva
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Mobile card representation of a single table row */
function MobileCard<T extends Record<string, unknown>>({
  row,
  primaryColumns,
  secondaryColumns,
  tableId,
  rowKey,
}: {
  row: T;
  primaryColumns: Column<T>[];
  secondaryColumns: Column<T>[];
  tableId: string;
  rowKey: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const detailId = `${tableId}-detail-${rowKey}`;

  return (
    <div className="px-4 py-3">
      {/* Primary info always visible */}
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-controls={detailId}
      >
        <div className="min-w-0 flex-1 space-y-1">
          {primaryColumns.map((col) => (
            <div key={col.key}>
              {col === primaryColumns[0] ? (
                <p className="font-semibold text-emerald-950">
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </p>
              ) : (
                <p className="text-sm text-emerald-950/65">
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </p>
              )}
            </div>
          ))}
        </div>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-emerald-950/30 transition-transform duration-200",
            expanded && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {/* Expanded secondary info */}
      {expanded && secondaryColumns.length > 0 ? (
        <div id={detailId} className="mt-3 space-y-2 border-t border-emerald-950/5 pt-3 animate-in-slide-down">
          {secondaryColumns.map((col) => (
            <div key={col.key} className="flex items-start justify-between gap-3 text-sm">
              <span className="shrink-0 font-medium text-emerald-950/50">
                {col.header}
              </span>
              <span className="text-right text-emerald-950/75">
                {col.render ? col.render(row) : String(row[col.key] ?? "")}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
