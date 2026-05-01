"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { CloudSun, Home, Menu, Search, Tractor, Trees, User, X } from "lucide-react";
import { trapFocus } from "@/lib/focus-management";

interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
  section: string;
  keywords?: string[];
  priority?: boolean;
}

interface DashboardLayoutProps {
  brand: string;
  items: SidebarItem[];
  children: ReactNode;
}

const MOBILE_TABS = [
  { label: "Home", href: "/dashboard", icon: <Home className="h-5 w-5" aria-hidden="true" /> },
  { label: "Campi", href: "/dashboard/fields", icon: <Trees className="h-5 w-5" aria-hidden="true" /> },
  { label: "Meteo", href: "/dashboard/weather", icon: <CloudSun className="h-5 w-5" aria-hidden="true" /> },
  { label: "Raccolta", href: "/dashboard/harvest", icon: <Tractor className="h-5 w-5" aria-hidden="true" /> },
  { label: "Profilo", href: "/dashboard/rbac", icon: <User className="h-5 w-5" aria-hidden="true" /> },
];

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

export function DashboardShell({ brand, items, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const filteredGroups = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);
    const visibleItems = normalizedQuery
      ? items.filter((item) => {
          const haystack = [item.label, item.section, ...(item.keywords ?? [])].join(" ").toLowerCase();
          return haystack.includes(normalizedQuery);
        })
      : items;

    return visibleItems.reduce<Record<string, SidebarItem[]>>((groups, item) => {
      if (!groups[item.section]) groups[item.section] = [];
      groups[item.section].push(item);
      return groups;
    }, {});
  }, [items, query]);

  const primaryItems = useMemo(() => items.filter((item) => item.priority).slice(0, 6), [items]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    mobileSearchRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileMenuOpen(false);
        mobileTriggerRef.current?.focus();
        return;
      }

      trapFocus(event, mobileDrawerRef.current);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const sidebarSearch = (
    <label className="relative block">
      <span className="sr-only">Cerca una sezione</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-100/55" aria-hidden="true" />
      <input
        ref={mobileSearchRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Cerca moduli, flussi, analytics…"
        className="w-full rounded-2xl border border-emerald-50/10 bg-emerald-50/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-emerald-100/55"
      />
    </label>
  );

  const navigationContent = (tone: "dark" | "light") => {
    const textClass = tone === "dark" ? "text-emerald-100/80" : "text-emerald-950/75";
    const hoverClass = tone === "dark"
      ? "hover:bg-emerald-50/10 hover:text-white"
      : "hover:bg-emerald-100/70 hover:text-emerald-950";
    const activeClass = tone === "dark" ? "bg-emerald-50 text-emerald-950" : "bg-emerald-950 text-white";
    const headingClass = tone === "dark" ? "text-emerald-100/55" : "text-emerald-950/45";

    return (
      <>
        {!query ? (
          <div className="mb-6 rounded-2xl border border-emerald-50/10 bg-emerald-50/5 p-4">
            <p className={cn("text-xs font-semibold uppercase tracking-[0.18em]", headingClass)}>
              Workflow principali
            </p>
            <div className="mt-3 grid gap-2">
              {primaryItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive ? activeClass : cn(textClass, hoverClass)
                    )}
                  >
                    <span className="h-5 w-5" aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}

        {Object.entries(filteredGroups).map(([section, sectionItems]) => (
          <div key={section} className="mb-5">
            <p className={cn("mb-2 px-3 text-xs font-semibold uppercase tracking-[0.18em]", headingClass)}>
              {section}
            </p>
            <div className="space-y-1">
              {sectionItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive ? activeClass : cn(textClass, hoverClass)
                    )}
                  >
                    <span className="h-5 w-5" aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {Object.keys(filteredGroups).length === 0 ? (
          <p className={cn("rounded-2xl border px-4 py-3 text-sm", tone === "dark"
            ? "border-emerald-50/10 bg-emerald-50/5 text-emerald-100/75"
            : "border-emerald-950/10 bg-white/80 text-emerald-950/65")}
          >
            Nessun modulo trovato. Prova con “tracciabilità”, “compliance” o “analytics”.
          </p>
        ) : null}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#eff3ea] text-emerald-950 lg:flex">
      <aside className="hidden w-80 flex-shrink-0 border-r border-emerald-950/10 bg-[#193524] text-emerald-50 lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b border-emerald-50/10 px-6 py-5">
            <Link href="/dashboard" className="text-lg font-bold tracking-tight text-white">
              {brand}
            </Link>
            <p className="mt-1 text-sm text-emerald-100/70">Centro operativo cooperativo</p>
            <div className="mt-4">{sidebarSearch}</div>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigazione dashboard">
            {navigationContent("dark")}
          </nav>
        </div>
      </aside>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside
            ref={mobileDrawerRef}
            className="absolute left-0 top-0 flex h-full w-[88vw] max-w-sm flex-col overflow-y-auto bg-[#193524] text-emerald-50 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-dashboard-menu-title"
          >
            <div className="border-b border-emerald-50/10 px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/55">Navigazione</p>
                  <Link
                    href="/dashboard"
                    className="mt-1 block text-lg font-bold tracking-tight text-white"
                    onClick={() => setMobileMenuOpen(false)}
                    id="mobile-dashboard-menu-title"
                  >
                    {brand}
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    mobileTriggerRef.current?.focus();
                  }}
                  className="rounded-full p-2 text-emerald-100 hover:bg-emerald-50/10"
                  aria-label="Chiudi menu"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-4">{sidebarSearch}</div>
            </div>
            <nav className="flex-1 px-3 py-4" aria-label="Navigazione dashboard mobile">
              {navigationContent("dark")}
            </nav>
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-emerald-950/10 bg-[#f7f4ec]/90 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <button
              ref={mobileTriggerRef}
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-full border border-emerald-950/10 p-2 text-emerald-950 hover:bg-emerald-100"
              aria-label="Apri menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-dashboard-menu-title"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1">
              <Link href="/dashboard" className="block truncate text-lg font-bold tracking-tight text-emerald-950">
                {brand}
              </Link>
              <p className="text-xs text-emerald-950/55">Workflow, monitoraggio e operatività</p>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-8 lg:pb-10">
          {children}
        </main>

        <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-950/10 bg-white/95 backdrop-blur lg:hidden" aria-label="Navigazione principale mobile">
          <div className="flex items-center justify-around px-2 py-1">
            {MOBILE_TABS.map((tab) => {
              const isActive = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    isActive ? "text-emerald-700" : "text-emerald-950/50 hover:text-emerald-700"
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

const trendPrefixes: Record<NonNullable<StatCardProps["trend"]>, string> = {
  up: "↑",
  down: "↓",
  neutral: "•",
};

export function StatCard({ label, value, change, trend = "neutral" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
      <p className="text-sm font-medium text-emerald-950/60">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-950">{value}</p>
      {change ? (
        <p
          className={cn(
            "mt-2 text-sm font-medium",
            trend === "up" && "text-emerald-700",
            trend === "down" && "text-amber-700",
            trend === "neutral" && "text-emerald-950/55"
          )}
        >
          <span className="mr-1" aria-hidden="true">{trendPrefixes[trend]}</span>
          {change}
        </p>
      ) : null}
    </div>
  );
}
