"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { focusFirstElement, trapFocus } from "@/lib/focus-management";

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
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    focusFirstElement(menuRef.current);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      trapFocus(event, menuRef.current);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

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
              aria-current={pathname === item.href ? "page" : undefined}
              className="text-sm font-medium text-emerald-950/75 underline-offset-4 transition-colors hover:text-emerald-700 hover:underline"
            >
              {item.label}
            </Link>
          ))}
          {ctaLabel && ctaHref ? (
            <Link
              href={ctaHref}
              className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>

        <button
          ref={triggerRef}
          type="button"
          className="rounded-full border border-emerald-950/10 p-2 text-emerald-950 md:hidden"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-site-menu"
          aria-label="Apri il menu principale"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] bg-emerald-950/45 px-4 py-6 md:hidden" role="presentation">
          <div
            ref={menuRef}
            id="mobile-site-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-site-menu-title"
            className="mx-auto max-w-lg rounded-3xl border border-emerald-950/10 bg-[#f7f4ec] p-4 shadow-2xl shadow-emerald-950/20"
          >
            <div className="flex items-center justify-between gap-3 border-b border-emerald-950/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Navigazione
                </p>
                <h2 id="mobile-site-menu-title" className="mt-1 text-lg font-semibold text-emerald-950">
                  {brand}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className="rounded-full p-2 text-emerald-950/60 transition hover:bg-emerald-100 hover:text-emerald-950"
                aria-label="Chiudi il menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-2 py-4">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="block rounded-2xl px-3 py-3 text-base font-medium text-emerald-950/85 transition-colors hover:bg-emerald-50 hover:text-emerald-800"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {ctaLabel && ctaHref ? (
              <Link
                href={ctaHref}
                className="mt-2 block rounded-2xl bg-emerald-800 px-3 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-emerald-700"
                onClick={() => setOpen(false)}
              >
                {ctaLabel}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
