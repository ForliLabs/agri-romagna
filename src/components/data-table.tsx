"use client";

import { useState, useMemo, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  getValue?: (row: T) => string | number;
  className?: string;
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
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(0);

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

  function SortIcon({ colKey }: { colKey: string }) {
    if (sortKey !== colKey) return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-emerald-950/30" />;
    return sortDir === "asc"
      ? <ChevronUp className="ml-1 inline h-3.5 w-3.5 text-emerald-700" />
      : <ChevronDown className="ml-1 inline h-3.5 w-3.5 text-emerald-700" />;
  }

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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
          <thead className="bg-[#f7f4ec] text-emerald-950/65">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-6 py-4 font-semibold", col.className, col.sortable && "cursor-pointer select-none")}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                >
                  {col.header}
                  {col.sortable && <SortIcon colKey={col.key} />}
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
                <tr key={String(row[keyField])}>
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
