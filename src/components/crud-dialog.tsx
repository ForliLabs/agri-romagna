"use client";

import { useState, useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { Plus, X, Edit3, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { trapFocus, focusFirstElement } from "@/lib/focus-management";

interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | number;
}

interface CrudDialogProps {
  title: string;
  fields: FormField[];
  onSubmit: (data: Record<string, string | number>) => Promise<void>;
  open: boolean;
  onClose: () => void;
  initialValues?: Record<string, string | number>;
  submitLabel?: string;
}

export function CrudDialog({
  title,
  fields,
  onSubmit,
  open,
  onClose,
  initialValues,
  submitLabel = "Salva",
}: CrudDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // Focus first focusable element when dialog opens
    requestAnimationFrame(() => focusFirstElement(dialogRef.current));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      trapFocus(e, dialogRef.current);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData(e.currentTarget);
      const data: Record<string, string | number> = {};
      for (const field of fields) {
        const raw = formData.get(field.name);
        if (field.type === "number") {
          data[field.name] = Number(raw);
        } else {
          data[field.name] = String(raw ?? "");
        }
      }
      await onSubmit(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il salvataggio.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="presentation">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative mx-4 w-full max-w-lg rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-xl dark:border-emerald-50/10 dark:bg-[#162b1e]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crud-dialog-title"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="crud-dialog-title" className="text-xl font-bold text-emerald-950 dark:text-emerald-50">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-emerald-950/60 hover:bg-emerald-100 dark:text-emerald-100/60 dark:hover:bg-emerald-50/10"
            aria-label="Chiudi"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {error && (
          <div role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label htmlFor={`crud-${field.name}`} className="block text-sm font-medium text-emerald-950/75 dark:text-emerald-100/75">
                {field.label}
                {field.required && <span className="ml-1 text-rose-500">*</span>}
              </label>
              {field.type === "select" ? (
                <select
                  id={`crud-${field.name}`}
                  name={field.name}
                  required={field.required}
                  defaultValue={initialValues?.[field.name] ?? field.defaultValue ?? ""}
                  className="mt-1 w-full rounded-xl border border-emerald-950/10 bg-[#f7f4ec] px-3 py-2 text-sm text-emerald-950 dark:border-emerald-50/10 dark:bg-[#0c1a12] dark:text-emerald-50"
                >
                  <option value="">Seleziona…</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  id={`crud-${field.name}`}
                  name={field.name}
                  required={field.required}
                  placeholder={field.placeholder}
                  defaultValue={initialValues?.[field.name] ?? field.defaultValue ?? ""}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-emerald-950/10 bg-[#f7f4ec] px-3 py-2 text-sm text-emerald-950 dark:border-emerald-50/10 dark:bg-[#0c1a12] dark:text-emerald-50"
                />
              ) : (
                <input
                  id={`crud-${field.name}`}
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  placeholder={field.placeholder}
                  defaultValue={initialValues?.[field.name] ?? field.defaultValue ?? ""}
                  step={field.type === "number" ? "any" : undefined}
                  className="mt-1 w-full rounded-xl border border-emerald-950/10 bg-[#f7f4ec] px-3 py-2 text-sm text-emerald-950 dark:border-emerald-50/10 dark:bg-[#0c1a12] dark:text-emerald-50"
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-emerald-950/10 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50 dark:border-emerald-50/10 dark:text-emerald-50 dark:hover:bg-emerald-50/5"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Salvataggio…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Action buttons for CRUD
export function CrudActionBar({ onAdd, addLabel = "Aggiungi" }: { onAdd: () => void; addLabel?: string }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      {addLabel}
    </button>
  );
}

export function EditButton({ onClick, label = "Modifica" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-50/10"
      aria-label={label}
    >
      <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}

export function DeleteButton({ onClick, label = "Elimina" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-50/10"
      aria-label={label}
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}

interface CrudPanelProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  actionBar?: ReactNode;
  children: ReactNode;
}

export function CrudPanel({ title, subtitle, icon, actionBar, children }: CrudPanelProps) {
  return (
    <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">{title}</h2>
            {subtitle && <p className="text-sm text-emerald-950/65">{subtitle}</p>}
          </div>
        </div>
        {actionBar}
      </div>
      <div className="mt-6">{children}</div>
    </article>
  );
}
