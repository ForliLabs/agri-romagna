"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Leaf,
  MapPin,
  Sparkles,
  Trees,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface OnboardingWizardData {
  cooperativeName: string;
  region: string;
  province: string;
  plan: string;
  adminName: string;
  adminEmail: string;
  farmName: string;
  farmLocation: string;
  farmHectares: number;
  farmSpecialty: string;
}

interface OnboardingWizardProps {
  onComplete?: (data: OnboardingWizardData) => void;
  onSkip?: () => void;
}

const STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Benvenuto in AgriRomagna",
    description: "La piattaforma digitale per cooperative e aziende agricole romagnole.",
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    id: "cooperative",
    title: "La tua cooperativa",
    description: "Inserisci i dati della cooperativa agricola.",
    icon: <Building2 className="h-8 w-8" />,
  },
  {
    id: "admin",
    title: "Account amministratore",
    description: "Configura le credenziali per l'accesso alla piattaforma.",
    icon: <User className="h-8 w-8" />,
  },
  {
    id: "farm",
    title: "Prima azienda agricola",
    description: "Aggiungi la prima azienda da gestire.",
    icon: <Trees className="h-8 w-8" />,
  },
  {
    id: "complete",
    title: "Tutto pronto!",
    description: "La configurazione iniziale è completa.",
    icon: <CheckCircle2 className="h-8 w-8" />,
  },
];

const PROVINCES = [
  "Forlì-Cesena",
  "Ravenna",
  "Rimini",
  "Bologna",
  "Ferrara",
  "Modena",
  "Reggio Emilia",
  "Parma",
  "Piacenza",
];

const SPECIALTIES = [
  "Viticoltura",
  "Frutticoltura",
  "Orticoltura",
  "Cerealicoltura",
  "Olivicoltura",
  "Zootecnia",
  "Mista",
];

function FormField({
  label,
  children,
  required,
  htmlFor,
  error,
  errorId,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  error?: string;
  errorId?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-emerald-950/70">
        {label}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClassName =
  "w-full rounded-xl border border-emerald-950/10 bg-[#f7f4ec] px-4 py-2.5 text-sm text-emerald-950 placeholder:text-emerald-950/35 transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";
const inputInvalidClassName =
  "w-full rounded-xl border border-rose-300 bg-[#f7f4ec] px-4 py-2.5 text-sm text-emerald-950 placeholder:text-emerald-950/35 transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20";
const selectClassName =
  "w-full rounded-xl border border-emerald-950/10 bg-[#f7f4ec] px-4 py-2.5 text-sm text-emerald-950 transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";

/** Returns the correct input class based on whether the field has an error */
function inputClass(error?: string) {
  return error ? inputInvalidClassName : inputClassName;
}

/** Shared aria props for validated fields */
function validationProps(fieldKey: string, error?: string) {
  const errorId = `onb-${fieldKey}-error`;
  return {
    "aria-invalid": Boolean(error) as boolean,
    "aria-describedby": error ? errorId : undefined,
  };
}

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [data, setData] = useState<OnboardingWizardData>({
    cooperativeName: "",
    region: "Emilia-Romagna",
    province: "Forlì-Cesena",
    plan: "cooperativa",
    adminName: "",
    adminEmail: "",
    farmName: "",
    farmLocation: "",
    farmHectares: 0,
    farmSpecialty: "Viticoltura",
  });

  const step = STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateField = useCallback(
    <K extends keyof OnboardingWizardData>(
      key: K,
      value: OnboardingWizardData[K]
    ) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0:
        return true; // Welcome step
      case 1:
        return data.cooperativeName.trim().length >= 2;
      case 2:
        return (
          data.adminName.trim().length >= 2 &&
          data.adminEmail.includes("@")
        );
      case 3:
        return (
          data.farmName.trim().length >= 2 && data.farmHectares > 0
        );
      case 4:
        return true; // Complete step
      default:
        return false;
    }
  }, [currentStep, data]);

  const fieldErrors = useMemo(() => {
    const errors: Partial<Record<keyof OnboardingWizardData, string>> = {};
    if (touched.has("cooperativeName") && data.cooperativeName.trim().length < 2)
      errors.cooperativeName = "Il nome deve avere almeno 2 caratteri.";
    if (touched.has("adminName") && data.adminName.trim().length < 2)
      errors.adminName = "Il nome deve avere almeno 2 caratteri.";
    if (touched.has("adminEmail") && !data.adminEmail.includes("@"))
      errors.adminEmail = "Inserisci un indirizzo email valido.";
    if (touched.has("farmName") && data.farmName.trim().length < 2)
      errors.farmName = "Il nome deve avere almeno 2 caratteri.";
    if (touched.has("farmHectares") && data.farmHectares <= 0)
      errors.farmHectares = "Inserisci un valore maggiore di zero.";
    return errors;
  }, [data, touched]);

  const markTouched = useCallback((field: string) => {
    setTouched((prev) => new Set(prev).add(field));
  }, []);

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete?.(data);
    } else {
      setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  }, [isLast, data, onComplete]);

  const handlePrev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-[#f4f1e8]">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-16">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-emerald-950/50">
            <span>
              Passo {currentStep + 1} di {STEPS.length}
            </span>
            {onSkip && currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={onSkip}
                className="font-medium text-emerald-700 transition hover:text-emerald-800"
              >
                Salta configurazione
              </button>
            ) : null}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="mt-4 flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                    i < currentStep
                      ? "bg-emerald-600 text-white"
                      : i === currentStep
                        ? "bg-emerald-950 text-white ring-4 ring-emerald-200"
                        : "bg-emerald-100 text-emerald-950/40"
                  )}
                  aria-label={
                    i < currentStep
                      ? `Passo ${i + 1}: ${s.title} — completato`
                      : i === currentStep
                        ? `Passo ${i + 1}: ${s.title} — corrente`
                        : `Passo ${i + 1}: ${s.title}`
                  }
                >
                  {i < currentStep ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < STEPS.length - 1 ? (
                  <div
                    className={cn(
                      "h-0.5 w-8 sm:w-12",
                      i < currentStep ? "bg-emerald-600" : "bg-emerald-100"
                    )}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Step content card */}
        <div className="animate-in-fade rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-lg shadow-emerald-950/5 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              {step.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950 sm:text-2xl">
                {step.title}
              </h2>
              <p className="mt-1 text-sm text-emerald-950/60">
                {step.description}
              </p>
            </div>
          </div>

          <div className="mt-6">
            {/* Welcome step */}
            {currentStep === 0 ? (
              <div className="space-y-4 text-sm leading-relaxed text-emerald-950/70">
                <p>
                  AgriRomagna ti permette di gestire campi, raccolta, conformità
                  e vendita diretta dalla stessa piattaforma.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: <Trees className="h-4 w-4" />, text: "Gestione campi e colture" },
                    { icon: <Leaf className="h-4 w-4" />, text: "Monitoraggio sostenibilità" },
                    { icon: <MapPin className="h-4 w-4" />, text: "Tracciabilità completa" },
                    { icon: <Building2 className="h-4 w-4" />, text: "Cooperativa digitale" },
                  ].map((feature) => (
                    <div
                      key={feature.text}
                      className="flex items-center gap-2.5 rounded-xl border border-emerald-950/5 bg-emerald-50/50 px-3 py-2.5"
                    >
                      <span className="text-emerald-700">{feature.icon}</span>
                      <span className="font-medium text-emerald-950">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-emerald-950/50">
                  La configurazione richiede circa 2 minuti.
                </p>
              </div>
            ) : null}

            {/* Cooperative step */}
            {currentStep === 1 ? (
              <div className="space-y-4">
                <FormField label="Nome cooperativa" required htmlFor="onb-cooperativeName" error={fieldErrors.cooperativeName} errorId="onb-cooperativeName-error">
                  <input
                    id="onb-cooperativeName"
                    type="text"
                    value={data.cooperativeName}
                    onChange={(e) =>
                      updateField("cooperativeName", e.target.value)
                    }
                    onBlur={() => markTouched("cooperativeName")}
                    placeholder="es. Cooperativa Agricola Bertinoro"
                    {...validationProps("cooperativeName", fieldErrors.cooperativeName)}
                    className={inputClass(fieldErrors.cooperativeName)}
                    autoFocus
                  />
                </FormField>
                <FormField label="Provincia" required htmlFor="onb-province">
                  <select
                    id="onb-province"
                    value={data.province}
                    onChange={(e) => updateField("province", e.target.value)}
                    className={selectClassName}
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Piano">
                  <div className="grid grid-cols-2 gap-2" role="group" aria-label="Tipo di piano">
                    {[
                      { value: "cooperativa", label: "Cooperativa" },
                      { value: "azienda", label: "Azienda singola" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={data.plan === option.value}
                        onClick={() => updateField("plan", option.value)}
                        className={cn(
                          "rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition",
                          data.plan === option.value
                            ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                            : "border-emerald-950/10 text-emerald-950/60 hover:border-emerald-950/20"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </FormField>
              </div>
            ) : null}

            {/* Admin step */}
            {currentStep === 2 ? (
              <div className="space-y-4">
                <FormField label="Nome completo" required htmlFor="onb-adminName" error={fieldErrors.adminName} errorId="onb-adminName-error">
                  <input
                    id="onb-adminName"
                    type="text"
                    value={data.adminName}
                    onChange={(e) => updateField("adminName", e.target.value)}
                    onBlur={() => markTouched("adminName")}
                    placeholder="es. Marco Tondini"
                    {...validationProps("adminName", fieldErrors.adminName)}
                    className={inputClass(fieldErrors.adminName)}
                    autoFocus
                  />
                </FormField>
                <FormField label="Email" required htmlFor="onb-adminEmail" error={fieldErrors.adminEmail} errorId="onb-adminEmail-error">
                  <input
                    id="onb-adminEmail"
                    type="email"
                    value={data.adminEmail}
                    onChange={(e) => updateField("adminEmail", e.target.value)}
                    onBlur={() => markTouched("adminEmail")}
                    placeholder="es. marco@cooperativa.it"
                    {...validationProps("adminEmail", fieldErrors.adminEmail)}
                    className={inputClass(fieldErrors.adminEmail)}
                  />
                </FormField>
              </div>
            ) : null}

            {/* Farm step */}
            {currentStep === 3 ? (
              <div className="space-y-4">
                <FormField label="Nome azienda" required htmlFor="onb-farmName" error={fieldErrors.farmName} errorId="onb-farmName-error">
                  <input
                    id="onb-farmName"
                    type="text"
                    value={data.farmName}
                    onChange={(e) => updateField("farmName", e.target.value)}
                    onBlur={() => markTouched("farmName")}
                    placeholder="es. Podere San Mamante"
                    {...validationProps("farmName", fieldErrors.farmName)}
                    className={inputClass(fieldErrors.farmName)}
                    autoFocus
                  />
                </FormField>
                <FormField label="Località" htmlFor="onb-farmLocation">
                  <input
                    id="onb-farmLocation"
                    type="text"
                    value={data.farmLocation}
                    onChange={(e) =>
                      updateField("farmLocation", e.target.value)
                    }
                    placeholder="es. Bertinoro (FC)"
                    className={inputClassName}
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Ettari" required htmlFor="onb-farmHectares" error={fieldErrors.farmHectares} errorId="onb-farmHectares-error">
                    <input
                      id="onb-farmHectares"
                      type="number"
                      value={data.farmHectares || ""}
                      onChange={(e) =>
                        updateField(
                          "farmHectares",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      onBlur={() => markTouched("farmHectares")}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      {...validationProps("farmHectares", fieldErrors.farmHectares)}
                      className={inputClass(fieldErrors.farmHectares)}
                    />
                  </FormField>
                  <FormField label="Specializzazione" htmlFor="onb-farmSpecialty">
                    <select
                      id="onb-farmSpecialty"
                      value={data.farmSpecialty}
                      onChange={(e) =>
                        updateField("farmSpecialty", e.target.value)
                      }
                      className={selectClassName}
                    >
                      {SPECIALTIES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </div>
            ) : null}

            {/* Complete step */}
            {currentStep === 4 ? (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 animate-in-scale">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-emerald-950">
                  Configurazione completata
                </h3>
                <p className="mt-2 text-sm text-emerald-950/60">
                  La cooperativa{" "}
                  <strong>{data.cooperativeName}</strong> è pronta.
                  Puoi iniziare ad aggiungere campi, pianificare raccolte e
                  monitorare le attività.
                </p>
                <div className="mt-6 rounded-2xl border border-emerald-950/5 bg-emerald-50/50 p-4 text-left text-sm">
                  <p className="font-semibold text-emerald-950">Riepilogo:</p>
                  <ul className="mt-2 space-y-1 text-emerald-950/70">
                    <li>
                      • Cooperativa:{" "}
                      <span className="font-medium text-emerald-950">
                        {data.cooperativeName}
                      </span>
                    </li>
                    <li>
                      • Amministratore:{" "}
                      <span className="font-medium text-emerald-950">
                        {data.adminName}
                      </span>
                    </li>
                    <li>
                      • Azienda:{" "}
                      <span className="font-medium text-emerald-950">
                        {data.farmName} ({data.farmHectares} ha)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {!isFirst ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-950/10 bg-white px-4 py-2.5 text-sm font-medium text-emerald-950 transition hover:bg-emerald-50"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Indietro
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-sm font-semibold transition disabled:opacity-40",
              isLast
                ? "bg-emerald-700 text-white hover:bg-emerald-800"
                : "bg-emerald-950 text-white hover:bg-emerald-900"
            )}
          >
            {isLast ? (
              <>
                Inizia a usare AgriRomagna
                <Check className="h-4 w-4" aria-hidden="true" />
              </>
            ) : (
              <>
                Avanti
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Exported for testing
export { STEPS, PROVINCES, SPECIALTIES };
