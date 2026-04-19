"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

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

export function DashboardShell({ brand, items, children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#eff3ea] text-emerald-950 lg:flex">
      <aside className="hidden w-72 flex-shrink-0 border-r border-emerald-950/10 bg-[#193524] text-emerald-50 lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-emerald-50/10 px-6 py-5">
            <Link href="/dashboard" className="text-lg font-bold tracking-tight text-white">
              {brand}
            </Link>
            <p className="mt-1 text-sm text-emerald-100/70">Centro operativo cooperativo</p>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
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

      <div className="flex-1">
        <header className="sticky top-0 z-30 border-b border-emerald-950/10 bg-[#f7f4ec]/90 backdrop-blur lg:hidden">
          <div className="px-4 py-4 sm:px-6">
            <Link href="/dashboard" className="text-lg font-bold tracking-tight text-emerald-950">
              {brand}
            </Link>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "border-emerald-800 bg-emerald-800 text-white"
                        : "border-emerald-900/10 bg-white text-emerald-950/80"
                    )}
                  >
                    <span className="h-4 w-4">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
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
