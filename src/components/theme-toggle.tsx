"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("agri-theme") as Theme | null;
    const initial = stored ?? "system";
    setTheme(initial);
    applyTheme(initial);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const current = localStorage.getItem("agri-theme") as Theme | null;
      if (!current || current === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    localStorage.setItem("agri-theme", next);
    applyTheme(next);
  }

  if (!mounted) return null;

  const resolved = theme === "system" ? getSystemTheme() : theme;
  const label = theme === "system" ? "Tema di sistema" : resolved === "dark" ? "Tema scuro" : "Tema chiaro";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-emerald-950/10 p-2 text-emerald-950/70 transition hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-50/10 dark:text-emerald-100/70 dark:hover:bg-emerald-50/10 dark:hover:text-emerald-50"
      aria-label={label}
      title={label}
    >
      {resolved === "dark" ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
