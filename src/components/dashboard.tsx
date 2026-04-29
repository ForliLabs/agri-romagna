"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { type ReactNode, useState } from "react";
import { Menu, X, Home, Trees, CloudSun, Tractor, User } from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  brand: string;
  items: SidebarItem[];
  children: ReactNode;
}

// Bottom tab navigation for mobile - 5 key areas
const MOBILE_TABS = [
  { label: "Home", href: "/dashboard", icon: <Home className="h-5 w-5" /> },
  { label: "Campi", href: "/dashboard/fields", icon: <Trees className="h-5 w-5" /> },
  { label: "Meteo", href: "/dashboard/weather", icon: <CloudSun className="h-5 w-5" /> },
  { label: "Raccolta", href: "/dashboard/harvest", icon: <Tractor className="h-5 w-5" /> },
  { label: "Profilo", href: "/dashboard/rbac", icon: <User className="h-5 w-5" /> },
];

export function DashboardShell({ brand, items, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#eff3ea] text-emerald-950 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 flex-shrink-0 border-r border-emerald-950/10 bg-[#193524] text-emerald-50 lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-emerald-50/10 px-6 py-5">
            <Link href="/dashboard" className="text-lg font-bold tracking-tight text-white">
              {brand}
            </Link>
            <p className="mt-1 text-sm text-emerald-100/70">Centro operativo cooperativo</p>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-950"
                      : "text-emerald-100/80 hover:bg-emerald-50/10 hover:text-white"
                  )}
                >
                  <span className="h-5 w-5">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-[#193524] text-emerald-50 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-50/10 px-6 py-5">
              <Link
                href="/dashboard"
                className="text-lg font-bold tracking-tight text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {brand}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1 text-emerald-100 hover:bg-emerald-50/10"
                aria-label="Chiudi menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1 px-3 py-4">
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-emerald-50 text-emerald-950"
                        : "text-emerald-100/80 hover:bg-emerald-50/10 hover:text-white"
                    )}
                  >
                    <span className="h-5 w-5">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 border-b border-emerald-950/10 bg-[#f7f4ec]/90 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-emerald-950 hover:bg-emerald-100"
              aria-label="Apri menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/dashboard" className="text-lg font-bold tracking-tight text-emerald-950">
              {brand}
            </Link>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main content - extra bottom padding on mobile for tab bar */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
          {children}
        </main>

        {/* Mobile bottom tab navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-950/10 bg-white/95 backdrop-blur safe-bottom lg:hidden">
          <div className="flex items-center justify-around px-2 py-1">
            {MOBILE_TABS.map((tab) => {
              const isActive = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "text-emerald-700"
                      : "text-emerald-950/50 hover:text-emerald-700"
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

export function StatCard({ label, value, change, trend }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
      <p className="text-sm font-medium text-emerald-950/60">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-950">{value}</p>
      {change && (
        <p
          className={cn(
            "mt-2 text-sm font-medium",
            trend === "up" && "text-emerald-700",
            trend === "down" && "text-amber-700",
            trend === "neutral" && "text-emerald-950/55"
          )}
        >
          {change}
        </p>
      )}
    </div>
  );
}
