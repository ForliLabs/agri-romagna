"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  brand: string;
  items: NavItem[];
  ctaLabel?: string;
  ctaHref?: string;
}

export function Navbar({ brand, items, ctaLabel, ctaHref }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-950/10 bg-[#f7f4ec]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-emerald-950">
          {brand}
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-emerald-950/75 transition-colors hover:text-emerald-700"
            >
              {item.label}
            </Link>
          ))}
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              {ctaLabel}
            </Link>
          )}
        </div>

        <button
          className="rounded-md p-1 text-emerald-950 md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Apri o chiudi il menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      <div
        className={cn(
          "border-t border-emerald-950/10 bg-[#f7f4ec] md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div className="space-y-1 px-4 py-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-xl px-3 py-2 text-base font-medium text-emerald-950/80 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="mt-2 block rounded-xl bg-emerald-800 px-3 py-2 text-center text-base font-semibold text-white transition-colors hover:bg-emerald-700"
              onClick={() => setOpen(false)}
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
