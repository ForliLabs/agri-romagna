"use client";

import { useReducer, useCallback, useRef, type ReactNode } from "react";
import {
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Droplets,
  Leaf,
  MapPin,
  ThermometerSun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";

export type InspectionCheckStatus = "pending" | "ok" | "issue" | "skipped";

export interface InspectionCheck {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
  status: InspectionCheckStatus;
  note?: string;
  photoRequired?: boolean;
}

export interface InspectionField {
  id: string;
  name: string;
  crop: string;
  areaHa: number;
  location?: string;
}

interface MobileFieldInspectionProps {
  field: InspectionField;
  initialChecks?: InspectionCheck[];
  onComplete?: (checks: InspectionCheck[]) => void;
  onCancel?: () => void;
}

const DEFAULT_CHECKS: Omit<InspectionCheck, "status">[] = [
  {
    id: "growth",
    label: "Stato vegetativo",
    description: "Valuta lo sviluppo fogliare e la vigoria della coltura",
    icon: <Leaf className="h-5 w-5" />,
  },
  {
    id: "irrigation",
    label: "Irrigazione",
    description: "Controlla livelli di umidità del suolo e funzionamento impianto",
    icon: <Droplets className="h-5 w-5" />,
  },
  {
    id: "pest",
    label: "Fitosanitario",
    description: "Cerca sintomi di malattie, insetti o erbe infestanti",
    icon: <ThermometerSun className="h-5 w-5" />,
    photoRequired: true,
  },
  {
    id: "soil",
    label: "Condizione suolo",
    description: "Verifica compattamento, drenaggio e struttura superficiale",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    id: "general",
    label: "Note generali",
    description: "Eventuali osservazioni aggiuntive e foto documentali",
    icon: <Camera className="h-5 w-5" />,
    photoRequired: true,
  },
];

const statusConfig: Record<
  InspectionCheckStatus,
  { label: string; className: string; bgClassName: string }
> = {
  pending: {
    label: "Da verificare",
    className: "text-emerald-950/40 border-emerald-950/15",
    bgClassName: "bg-white",
  },
  ok: {
    label: "OK",
    className: "text-emerald-700 border-emerald-300",
    bgClassName: "bg-emerald-50",
  },
  issue: {
    label: "Problema",
    className: "text-amber-700 border-amber-300",
    bgClassName: "bg-amber-50",
  },
  skipped: {
    label: "Saltato",
    className: "text-slate-500 border-slate-200",
    bgClassName: "bg-slate-50",
  },
};

interface InspectionState {
  checks: InspectionCheck[];
  currentStep: number;
  note: string;
  /** Photo data URIs keyed by check id */
  photos: Record<string, string>;
}

type InspectionAction =
  | { type: "SET_STATUS"; status: InspectionCheckStatus }
  | { type: "GO_NEXT" }
  | { type: "GO_PREV" }
  | { type: "GO_TO"; step: number }
  | { type: "SET_NOTE"; note: string }
  | { type: "CAPTURE_PHOTO"; dataUrl: string };

function inspectionReducer(state: InspectionState, action: InspectionAction): InspectionState {
  switch (action.type) {
    case "SET_STATUS":
      return {
        ...state,
        checks: state.checks.map((c, i) =>
          i === state.currentStep ? { ...c, status: action.status, note: state.note || c.note } : c
        ),
      };
    case "GO_NEXT": {
      const nextStep = state.currentStep + 1;
      if (nextStep >= state.checks.length) return state;
      return {
        ...state,
        checks: state.checks.map((c, i) =>
          i === state.currentStep ? { ...c, note: state.note || c.note } : c
        ),
        currentStep: nextStep,
        note: state.checks[nextStep]?.note ?? "",
      };
    }
    case "GO_PREV": {
      if (state.currentStep <= 0) return state;
      const prevStep = state.currentStep - 1;
      return {
        ...state,
        currentStep: prevStep,
        note: state.checks[prevStep]?.note ?? "",
      };
    }
    case "GO_TO":
      return {
        ...state,
        currentStep: action.step,
        note: state.checks[action.step]?.note ?? "",
      };
    case "SET_NOTE":
      return { ...state, note: action.note };
    case "CAPTURE_PHOTO": {
      const checkId = state.checks[state.currentStep]?.id;
      if (!checkId) return state;
      return {
        ...state,
        photos: { ...state.photos, [checkId]: action.dataUrl },
      };
    }
    default:
      return state;
  }
}

export function MobileFieldInspection({
  field,
  initialChecks,
  onComplete,
  onCancel,
}: MobileFieldInspectionProps) {
  const [state, dispatch] = useReducer(inspectionReducer, {
    checks: initialChecks ?? DEFAULT_CHECKS.map((c) => ({ ...c, status: "pending" as const })),
    currentStep: 0,
    note: "",
    photos: {},
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { checks, currentStep, note, photos } = state;

  const currentCheck = checks[currentStep];
  const totalSteps = checks.length;
  const completedCount = checks.filter(
    (c) => c.status !== "pending"
  ).length;
  const progress = (completedCount / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;

  const updateCheckStatus = useCallback(
    (status: InspectionCheckStatus) => {
      dispatch({ type: "SET_STATUS", status });
    },
    []
  );

  const goNext = useCallback(() => {
    if (isLastStep) {
      const finalChecks = checks.map((c, i) =>
        i === currentStep ? { ...c, note: note || c.note } : c
      );
      onComplete?.(finalChecks);
    } else {
      dispatch({ type: "GO_NEXT" });
    }
  }, [isLastStep, checks, currentStep, note, onComplete]);

  const goPrev = useCallback(() => {
    dispatch({ type: "GO_PREV" });
  }, []);

  const handleCapturePhoto = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          dispatch({ type: "CAPTURE_PHOTO", dataUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    []
  );

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#eff3ea] lg:min-h-0 lg:rounded-3xl lg:border lg:border-emerald-950/10 lg:shadow-sm">
      {/* Header with field info */}
      <header className="border-b border-emerald-950/10 bg-emerald-950 px-4 py-4 text-white safe-top">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-50/10"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Indietro
          </button>
          <ClipboardCheck className="h-5 w-5 text-emerald-300" aria-hidden="true" />
        </div>
        <div className="mt-3">
          <p className="text-xs uppercase tracking-[0.15em] text-emerald-300">
            Ispezione campo
          </p>
          <h1 className="mt-1 text-xl font-bold">{field.name}</h1>
          <p className="mt-0.5 text-sm text-emerald-100/70">
            {field.crop} · {field.areaHa} ha
            {field.location ? ` · ${field.location}` : ""}
          </p>
        </div>
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-emerald-100/60">
            <span>
              {completedCount} di {totalSteps} controlli
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <ProgressBar
            value={progress}
            label={`Progresso ispezione: ${completedCount} di ${totalSteps} controlli completati`}
            colorClass="bg-emerald-400"
            height="h-1.5"
            className="mt-1"
          />
        </div>
        {/* Live region to announce step and status changes to screen readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Passo {currentStep + 1} di {totalSteps}: {currentCheck?.label ?? ""}
          {currentCheck?.status !== "pending"
            ? ` — ${statusConfig[currentCheck.status].label}`
            : ""}
          {` · ${completedCount} di ${totalSteps} completati`}
        </div>
      </header>

      {/* Step indicator dots */}
      <div className="flex items-center justify-center gap-2 border-b border-emerald-950/10 bg-white/70 px-4 py-3">
        {checks.map((check, i) => (
          <button
            key={check.id}
            type="button"
            onClick={() => {
              dispatch({ type: "GO_TO", step: i });
            }}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all",
              i === currentStep
                ? "scale-125 bg-emerald-700"
                : check.status === "ok"
                  ? "bg-emerald-400"
                  : check.status === "issue"
                    ? "bg-amber-400"
                    : check.status === "skipped"
                      ? "bg-slate-300"
                      : "bg-emerald-950/15"
            )}
            aria-label={`Passo ${i + 1}: ${check.label}`}
            aria-current={i === currentStep ? "step" : undefined}
          />
        ))}
      </div>

      {/* Current check */}
      {currentCheck ? (
        <div className="flex-1 px-4 py-5 animate-in-fade">
          <div className="rounded-2xl border border-emerald-950/10 bg-white p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700" aria-hidden="true">
                {currentCheck.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-emerald-950">
                  {currentCheck.label}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-emerald-950/60">
                  {currentCheck.description}
                </p>
              </div>
            </div>

            {/* Status selection buttons — large touch targets for mobile */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {(["ok", "issue", "skipped"] as const).map((status) => {
                const config = statusConfig[status];
                const isActive = currentCheck.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateCheckStatus(status)}
                    className={cn(
                      "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition",
                      isActive
                        ? cn(config.bgClassName, config.className, "border-current")
                        : "border-emerald-950/10 text-emerald-950/50 hover:border-emerald-950/20"
                    )}
                  >
                    {status === "ok" ? (
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    ) : null}
                    {config.label}
                  </button>
                );
              })}
            </div>

            {/* Notes textarea */}
            <div className="mt-4">
              <label
                htmlFor={`note-${currentCheck.id}`}
                className="text-sm font-medium text-emerald-950/70"
              >
                Note {currentCheck.photoRequired ? "(foto consigliata)" : ""}
              </label>
              <textarea
                id={`note-${currentCheck.id}`}
                value={note}
                onChange={(e) => dispatch({ type: "SET_NOTE", note: e.target.value })}
                placeholder="Aggiungi osservazioni…"
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-emerald-950/10 bg-[#f7f4ec] px-4 py-2.5 text-sm text-emerald-950 placeholder:text-emerald-950/35"
              />
            </div>

            {/* Camera button for photo-required checks */}
            {currentCheck.photoRequired ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                  aria-label="Cattura foto dal campo"
                />
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-950/20 bg-emerald-50/50 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100/50"
                >
                  <Camera className="h-5 w-5" aria-hidden="true" />
                  Scatta foto
                </button>
                {photos[currentCheck.id] ? (
                  <div className="mt-2 overflow-hidden rounded-xl border border-emerald-950/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photos[currentCheck.id]}
                      alt={`Foto per ${currentCheck.label}`}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Navigation footer — fixed at bottom on mobile */}
      <footer className="border-t border-emerald-950/10 bg-white/95 px-4 py-3 safe-bottom">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 rounded-xl border border-emerald-950/10 px-4 py-2.5 text-sm font-medium text-emerald-950 transition hover:bg-emerald-50 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Indietro
          </button>

          <span className="text-sm font-medium text-emerald-950/40">
            {currentStep + 1} / {totalSteps}
          </span>

          <button
            type="button"
            onClick={goNext}
            className={cn(
              "flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              isLastStep
                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            )}
          >
            {isLastStep ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Completa
              </>
            ) : (
              <>
                Avanti
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

// Export for testing
export { DEFAULT_CHECKS, statusConfig };
