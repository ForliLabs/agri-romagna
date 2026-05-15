"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Plus, Sparkles } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast-provider";
import { readApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5;

type StepErrors = Record<string, string>;

interface FarmInput {
  name: string;
  location: string;
  hectares: number;
  specialty: string;
}

interface FieldInput {
  name: string;
  crop: string;
  areaHa: number;
  farmIndex: number;
  status: string;
  plantingDate: string;
}

interface MemberInput {
  name: string;
  email: string;
  role: string;
  farmIndex: number;
}

const STEPS = [
  { id: 1, label: "Cooperativa", description: "Dati della cooperativa" },
  { id: 2, label: "Amministratore", description: "Account admin" },
  { id: 3, label: "Aziende", description: "Registra le aziende" },
  { id: 4, label: "Campi", description: "Aggiungi appezzamenti" },
  { id: 5, label: "Membri", description: "Invita i membri" },
] as const;

const INITIAL_FARM: FarmInput = { name: "", location: "", hectares: 0, specialty: "" };
const INITIAL_FIELD: FieldInput = {
  name: "",
  crop: "",
  areaHa: 0,
  farmIndex: 0,
  status: "Registrato",
  plantingDate: "",
};
const INITIAL_MEMBER: MemberInput = {
  name: "",
  email: "",
  role: "farm_manager",
  farmIndex: 0,
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function inputClass(hasError: boolean) {
  return cn(
    "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-emerald-950",
    hasError ? "border-rose-300" : "border-emerald-200"
  );
}

function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-2 text-sm text-rose-700">{children}</p>;
}

export default function OnboardingPage() {
  const { pushToast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [banner, setBanner] = useState("");
  const [stepErrors, setStepErrors] = useState<StepErrors>({});
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false);
  const [createdCooperativeId, setCreatedCooperativeId] = useState("");

  const [cooperative, setCooperative] = useState({
    name: "",
    region: "Emilia-Romagna",
    province: "",
    plan: "cooperativa",
  });

  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [farms, setFarms] = useState<FarmInput[]>([INITIAL_FARM]);
  const [fields, setFields] = useState<FieldInput[]>([INITIAL_FIELD]);
  const [members, setMembers] = useState<MemberInput[]>([INITIAL_MEMBER]);

  const activationChecklist = useMemo(
    () => [
      `${cooperative.name ? "✓" : "•"} Definisci la cooperativa e l'ambito operativo`,
      `${admin.email ? "✓" : "•"} Crea l'account amministratore`,
      `${farms.some((farm) => farm.name) ? "✓" : "•"} Registra almeno un'azienda agricola`,
      `${fields.some((field) => field.name && field.crop) ? "✓" : "•"} Aggiungi almeno un appezzamento`,
      `${members.some((member) => member.name && member.email) ? "✓" : "•"} Invita il primo membro operativo`,
    ],
    [admin.email, cooperative.name, farms, fields, members]
  );

  const validateStep = (targetStep: Step) => {
    const errors: StepErrors = {};

    if (targetStep === 1) {
      if (!cooperative.name.trim()) errors["cooperative.name"] = "Inserisci il nome della cooperativa.";
      if (!cooperative.region.trim()) errors["cooperative.region"] = "Specifica la regione.";
      if (!cooperative.province.trim()) errors["cooperative.province"] = "Specifica la provincia.";
    }

    if (targetStep === 2) {
      if (!admin.name.trim()) errors["admin.name"] = "Inserisci il nome dell'amministratore.";
      if (!admin.email.trim()) errors["admin.email"] = "Inserisci l'email dell'amministratore.";
      else if (!isValidEmail(admin.email)) errors["admin.email"] = "L'email dell'amministratore non è valida.";
      if (!admin.password.trim()) errors["admin.password"] = "Inserisci una password iniziale.";
      else if (admin.password.trim().length < 8) errors["admin.password"] = "La password deve avere almeno 8 caratteri.";
    }

    if (targetStep === 3) {
      farms.forEach((farm, index) => {
        const hasData = Object.values(farm).some((value) => String(value).trim() !== "" && value !== 0);
        if (index === 0 || hasData) {
          if (!farm.name.trim()) errors[`farms.${index}.name`] = `Completa il nome dell'azienda ${index + 1}.`;
          if (!farm.location.trim()) errors[`farms.${index}.location`] = `Specifica la località dell'azienda ${index + 1}.`;
          if (farm.hectares <= 0) errors[`farms.${index}.hectares`] = `Inserisci gli ettari per l'azienda ${index + 1}.`;
        }
      });
    }

    if (targetStep === 4) {
      fields.forEach((field, index) => {
        const hasData = [field.name, field.crop, field.areaHa, field.plantingDate].some(
          (value) => String(value).trim() !== "" && value !== 0
        );
        if (index === 0 || hasData) {
          if (!field.name.trim()) errors[`fields.${index}.name`] = `Completa il nome del campo ${index + 1}.`;
          if (!field.crop.trim()) errors[`fields.${index}.crop`] = `Specifica la coltura del campo ${index + 1}.`;
          if (field.areaHa <= 0) errors[`fields.${index}.areaHa`] = `Inserisci una superficie valida per il campo ${index + 1}.`;
        }
      });
    }

    if (targetStep === 5) {
      members.forEach((member, index) => {
        const hasData = Object.values(member).some((value) => String(value).trim() !== "" && value !== 0);
        if (index === 0 || hasData) {
          if (!member.name.trim()) errors[`members.${index}.name`] = `Completa il nome del membro ${index + 1}.`;
          if (!member.email.trim()) errors[`members.${index}.email`] = `Specifica l'email del membro ${index + 1}.`;
          else if (!isValidEmail(member.email)) errors[`members.${index}.email`] = `L'email del membro ${index + 1} non è valida.`;
        }
      });
    }

    return errors;
  };

  const currentStepErrors = validateStep(step);
  const currentStepIsValid = Object.keys(currentStepErrors).length === 0;

  function updateValidationForCurrentStep() {
    const errors = validateStep(step);
    setStepErrors(errors);
    if (Object.keys(errors).length > 0) {
      setBanner("Completa i campi obbligatori evidenziati prima di proseguire.");
      return false;
    }
    setBanner("");
    return true;
  }

  function handleStepChange(nextStep: Step) {
    if (nextStep > step && !updateValidationForCurrentStep()) return;
    setStep(nextStep);
    setBanner("");
  }

  async function handleSubmit() {
    const allErrors = {
      ...validateStep(1),
      ...validateStep(2),
      ...validateStep(3),
      ...validateStep(4),
      ...validateStep(5),
    };

    setStepErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      setBanner("Rivedi i passaggi evidenziati: alcuni dati obbligatori sono ancora mancanti.");
      return;
    }

    setLoading(true);
    setBanner("");

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cooperative,
          admin,
          farms: farms.filter((farm) => farm.name.trim()),
          fields: fields.filter((field) => field.name.trim() && field.crop.trim()),
          members: members.filter((member) => member.name.trim() && member.email.trim()),
        }),
      });

      if (!response.ok) {
        setBanner(await readApiError(response));
        return;
      }

      const payload = (await response.json()) as { cooperative?: { id?: string } };
      setCreatedCooperativeId(payload.cooperative?.id || cooperative.name);
      setComplete(true);
      pushToast({
        variant: "success",
        title: "Configurazione completata",
        message: `La cooperativa ${cooperative.name} è pronta per il primo accesso.`,
      });
    } catch {
      setBanner("Errore di rete. Riprova tra qualche istante.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateSampleData() {
    setSampleLoading(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-sample-data", cooperativeId: createdCooperativeId || cooperative.name }),
      });

      if (!response.ok) {
        pushToast({
          variant: "error",
          title: "Dati demo non generati",
          message: await readApiError(response),
        });
        return;
      }

      setSampleDialogOpen(false);
      pushToast({
        variant: "success",
        title: "Dati demo pronti",
        message: "Abbiamo generato dati realistici per iniziare subito le prove operative.",
      });
    } catch {
      pushToast({
        variant: "error",
        title: "Errore di rete",
        message: "Impossibile generare i dati demo in questo momento.",
      });
    } finally {
      setSampleLoading(false);
    }
  }

  if (complete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eff3ea] p-4">
        <div className="w-full max-w-xl rounded-[2rem] border border-emerald-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-emerald-900">Benvenuto in AgriRomagna!</h1>
          <p className="mt-3 text-emerald-700">
            La cooperativa <strong>{cooperative.name}</strong> è stata creata con successo.
          </p>
          <div className="mt-6 grid gap-3 text-left text-sm text-emerald-950/70 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-[#f7f4ec] p-4">
              <p className="font-semibold text-emerald-950">Primo accesso</p>
              <p className="mt-2 leading-6">Accedi con l&apos;email amministratore oppure prova il flusso OTP demo se il numero è stato salvato.</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-[#f7f4ec] p-4">
              <p className="font-semibold text-emerald-950">Attivazione rapida</p>
              <p className="mt-2 leading-6">Genera dati demo realistici per vedere dashboard, campagne, ordini e tracciabilità già popolati.</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Accedi al dashboard →
            </Link>
            <button
              type="button"
              onClick={() => setSampleDialogOpen(true)}
              className="rounded-xl border border-emerald-200 px-6 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              Genera dati demo
            </button>
          </div>
          <ConfirmDialog
            open={sampleDialogOpen}
            title="Generare dati demo?"
            description="Questa azione popola la cooperativa con campagne, lotti, ordini e dati operativi dimostrativi. Usala solo per il first-run o per ambienti di prova."
            confirmLabel="Genera dati demo"
            loading={sampleLoading}
            onConfirm={handleGenerateSampleData}
            onCancel={() => setSampleDialogOpen(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#eff3ea]">
      <header className="border-b border-emerald-200 bg-white/80 px-4 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-emerald-900">🌱 AgriRomagna — Configurazione guidata</h1>
            <p className="mt-1 text-sm text-emerald-900/65">Imposta la cooperativa passo dopo passo e attiva il primo accesso in modo sicuro.</p>
          </div>
          <Link href="/" className="text-sm font-medium text-emerald-700 underline-offset-4 transition hover:text-emerald-900 hover:underline">
            Torna alla home
          </Link>
        </div>
      </header>

      <div className="border-b border-emerald-100 bg-white px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto">
          {STEPS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => handleStepChange(entry.id as Step)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                step === entry.id
                  ? "bg-emerald-700 text-white"
                  : step > entry.id
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-100 text-gray-500"
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                {step > entry.id ? "✓" : entry.id}
              </span>
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <main id="main" className="flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.55fr]">
          <section className="rounded-[2rem] border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5 sm:p-8">
            {banner ? (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
                {banner}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Passo 1</p>
                  <h2 className="mt-2 text-2xl font-bold text-emerald-900">Dati della cooperativa</h2>
                  <p className="mt-2 text-sm leading-6 text-emerald-900/65">Inserisci le informazioni di base che guideranno piani, geografia e dashboard iniziali.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-emerald-800">Nome cooperativa *</label>
                    <input
                      type="text"
                      value={cooperative.name}
                      onChange={(event) => setCooperative({ ...cooperative, name: event.target.value })}
                      className={inputClass(Boolean(stepErrors["cooperative.name"]))}
                      placeholder="es. Cooperativa Romagna Unita"
                    />
                    <ErrorText>{stepErrors["cooperative.name"]}</ErrorText>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-emerald-800">Regione *</label>
                    <input
                      type="text"
                      value={cooperative.region}
                      onChange={(event) => setCooperative({ ...cooperative, region: event.target.value })}
                      className={inputClass(Boolean(stepErrors["cooperative.region"]))}
                    />
                    <ErrorText>{stepErrors["cooperative.region"]}</ErrorText>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-emerald-800">Provincia *</label>
                    <input
                      type="text"
                      value={cooperative.province}
                      onChange={(event) => setCooperative({ ...cooperative, province: event.target.value })}
                      className={inputClass(Boolean(stepErrors["cooperative.province"]))}
                      placeholder="es. Forlì-Cesena"
                    />
                    <ErrorText>{stepErrors["cooperative.province"]}</ErrorText>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-emerald-800">Piano</label>
                    <select
                      value={cooperative.plan}
                      onChange={(event) => setCooperative({ ...cooperative, plan: event.target.value })}
                      className={inputClass(false)}
                    >
                      <option value="campo">Campo (base)</option>
                      <option value="agricoltore">Agricoltore (standard)</option>
                      <option value="cooperativa">Cooperativa (completo)</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Passo 2</p>
                  <h2 className="mt-2 text-2xl font-bold text-emerald-900">Account amministratore</h2>
                  <p className="mt-2 text-sm leading-6 text-emerald-900/65">Queste credenziali apriranno il dashboard e potranno invitare il resto della cooperativa.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-emerald-800">Nome completo *</label>
                    <input
                      type="text"
                      value={admin.name}
                      onChange={(event) => setAdmin({ ...admin, name: event.target.value })}
                      className={inputClass(Boolean(stepErrors["admin.name"]))}
                    />
                    <ErrorText>{stepErrors["admin.name"]}</ErrorText>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-emerald-800">Email *</label>
                    <input
                      type="email"
                      value={admin.email}
                      onChange={(event) => setAdmin({ ...admin, email: event.target.value })}
                      className={inputClass(Boolean(stepErrors["admin.email"]))}
                    />
                    <ErrorText>{stepErrors["admin.email"]}</ErrorText>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-emerald-800">Password *</label>
                    <input
                      type="password"
                      value={admin.password}
                      onChange={(event) => setAdmin({ ...admin, password: event.target.value })}
                      className={inputClass(Boolean(stepErrors["admin.password"]))}
                    />
                    <ErrorText>{stepErrors["admin.password"]}</ErrorText>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-emerald-800">Telefono</label>
                    <input
                      type="tel"
                      value={admin.phone}
                      onChange={(event) => setAdmin({ ...admin, phone: event.target.value })}
                      className={inputClass(false)}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Passo 3</p>
                    <h2 className="mt-2 text-2xl font-bold text-emerald-900">Aziende agricole</h2>
                    <p className="mt-2 text-sm leading-6 text-emerald-900/65">Registra le aziende associate. La prima è obbligatoria per attivare campi e ruoli.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFarms([...farms, { ...INITIAL_FARM }])}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Aggiungi azienda
                  </button>
                </div>
                <div className="space-y-4">
                  {farms.map((farm, index) => (
                    <div key={index} className="rounded-2xl border border-emerald-100 bg-[#f7f4ec] p-4">
                      <p className="mb-3 text-sm font-semibold text-emerald-800">Azienda {index + 1}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Nome azienda"
                            value={farm.name}
                            onChange={(event) => {
                              const updated = [...farms];
                              updated[index] = { ...farm, name: event.target.value };
                              setFarms(updated);
                            }}
                            className={inputClass(Boolean(stepErrors[`farms.${index}.name`]))}
                          />
                          <ErrorText>{stepErrors[`farms.${index}.name`]}</ErrorText>
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Località"
                            value={farm.location}
                            onChange={(event) => {
                              const updated = [...farms];
                              updated[index] = { ...farm, location: event.target.value };
                              setFarms(updated);
                            }}
                            className={inputClass(Boolean(stepErrors[`farms.${index}.location`]))}
                          />
                          <ErrorText>{stepErrors[`farms.${index}.location`]}</ErrorText>
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Ettari"
                            value={farm.hectares || ""}
                            onChange={(event) => {
                              const updated = [...farms];
                              updated[index] = { ...farm, hectares: parseFloat(event.target.value) || 0 };
                              setFarms(updated);
                            }}
                            className={inputClass(Boolean(stepErrors[`farms.${index}.hectares`]))}
                          />
                          <ErrorText>{stepErrors[`farms.${index}.hectares`]}</ErrorText>
                        </div>
                        <input
                          type="text"
                          placeholder="Specialità"
                          value={farm.specialty}
                          onChange={(event) => {
                            const updated = [...farms];
                            updated[index] = { ...farm, specialty: event.target.value };
                            setFarms(updated);
                          }}
                          className={inputClass(false)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Passo 4</p>
                    <h2 className="mt-2 text-2xl font-bold text-emerald-900">Appezzamenti</h2>
                    <p className="mt-2 text-sm leading-6 text-emerald-900/65">Collega ogni campo a un&apos;azienda per avere subito mappe, meteo e raccolta coerenti.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFields([...fields, { ...INITIAL_FIELD }])}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Aggiungi campo
                  </button>
                </div>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={index} className="rounded-2xl border border-emerald-100 bg-[#f7f4ec] p-4">
                      <p className="mb-3 text-sm font-semibold text-emerald-800">Campo {index + 1}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Nome campo"
                            value={field.name}
                            onChange={(event) => {
                              const updated = [...fields];
                              updated[index] = { ...field, name: event.target.value };
                              setFields(updated);
                            }}
                            className={inputClass(Boolean(stepErrors[`fields.${index}.name`]))}
                          />
                          <ErrorText>{stepErrors[`fields.${index}.name`]}</ErrorText>
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Coltura"
                            value={field.crop}
                            onChange={(event) => {
                              const updated = [...fields];
                              updated[index] = { ...field, crop: event.target.value };
                              setFields(updated);
                            }}
                            className={inputClass(Boolean(stepErrors[`fields.${index}.crop`]))}
                          />
                          <ErrorText>{stepErrors[`fields.${index}.crop`]}</ErrorText>
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Area (ha)"
                            value={field.areaHa || ""}
                            onChange={(event) => {
                              const updated = [...fields];
                              updated[index] = { ...field, areaHa: parseFloat(event.target.value) || 0 };
                              setFields(updated);
                            }}
                            className={inputClass(Boolean(stepErrors[`fields.${index}.areaHa`]))}
                          />
                          <ErrorText>{stepErrors[`fields.${index}.areaHa`]}</ErrorText>
                        </div>
                        <select
                          value={field.farmIndex}
                          onChange={(event) => {
                            const updated = [...fields];
                            updated[index] = { ...field, farmIndex: parseInt(event.target.value) };
                            setFields(updated);
                          }}
                          className={inputClass(false)}
                        >
                          {farms.map((farm, farmIndex) => (
                            <option key={farmIndex} value={farmIndex}>
                              {farm.name || `Azienda ${farmIndex + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 5 ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Passo 5</p>
                    <h2 className="mt-2 text-2xl font-bold text-emerald-900">Invita membri</h2>
                    <p className="mt-2 text-sm leading-6 text-emerald-900/65">Invia il primo invito operativo: almeno un membro completo aiuta ad attivare ruoli e onboarding secondario.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMembers([...members, { ...INITIAL_MEMBER }])}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Aggiungi membro
                  </button>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-[#f7f4ec] px-4 py-3 text-sm text-emerald-800">
                  I membri riceveranno una password temporanea iniziale. Potranno poi aggiornarla dal profilo personale.
                </div>
                <div className="space-y-4">
                  {members.map((member, index) => (
                    <div key={index} className="rounded-2xl border border-emerald-100 bg-[#f7f4ec] p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Nome completo"
                            value={member.name}
                            onChange={(event) => {
                              const updated = [...members];
                              updated[index] = { ...member, name: event.target.value };
                              setMembers(updated);
                            }}
                            className={inputClass(Boolean(stepErrors[`members.${index}.name`]))}
                          />
                          <ErrorText>{stepErrors[`members.${index}.name`]}</ErrorText>
                        </div>
                        <div>
                          <input
                            type="email"
                            placeholder="Email"
                            value={member.email}
                            onChange={(event) => {
                              const updated = [...members];
                              updated[index] = { ...member, email: event.target.value };
                              setMembers(updated);
                            }}
                            className={inputClass(Boolean(stepErrors[`members.${index}.email`]))}
                          />
                          <ErrorText>{stepErrors[`members.${index}.email`]}</ErrorText>
                        </div>
                        <select
                          value={member.role}
                          onChange={(event) => {
                            const updated = [...members];
                            updated[index] = { ...member, role: event.target.value };
                            setMembers(updated);
                          }}
                          className={inputClass(false)}
                        >
                          <option value="farm_manager">Responsabile azienda</option>
                          <option value="agronomist">Agronomo</option>
                          <option value="seasonal_worker">Operaio stagionale</option>
                          <option value="viewer">Osservatore</option>
                        </select>
                        <select
                          value={member.farmIndex}
                          onChange={(event) => {
                            const updated = [...members];
                            updated[index] = { ...member, farmIndex: parseInt(event.target.value) };
                            setMembers(updated);
                          }}
                          className={inputClass(false)}
                        >
                          {farms.map((farm, farmIndex) => (
                            <option key={farmIndex} value={farmIndex}>
                              {farm.name || `Azienda ${farmIndex + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 border-t border-emerald-950/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => handleStepChange(Math.max(1, step - 1) as Step)}
                disabled={step === 1}
                className="rounded-full border border-emerald-200 px-6 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Indietro
              </button>

              <div className="text-right">
                {!currentStepIsValid ? (
                  <p className="mb-2 text-sm text-amber-800">Completa i campi obbligatori per continuare.</p>
                ) : null}
                {step < 5 ? (
                  <button
                    type="button"
                    onClick={() => handleStepChange(Math.min(5, step + 1) as Step)}
                    disabled={!currentStepIsValid}
                    className="rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Avanti →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !currentStepIsValid}
                    className="rounded-full bg-emerald-700 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Creazione in corso…" : "Crea cooperativa ✓"}
                  </button>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <Sparkles className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Checklist attivazione</p>
                  <h2 className="mt-1 text-xl font-semibold text-emerald-950">Pronto al primo giorno</h2>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-emerald-950/70">
                {activationChecklist.map((item) => (
                  <li key={item} className="rounded-2xl bg-[#f7f4ec] px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[2rem] border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
              <h2 className="text-xl font-semibold text-emerald-950">Passo corrente</h2>
              <p className="mt-2 text-sm leading-6 text-emerald-950/70">{STEPS.find((entry) => entry.id === step)?.description}</p>
              <div className="mt-4 rounded-2xl bg-[#f7f4ec] p-4 text-sm text-emerald-950/70">
                <p className="font-semibold text-emerald-950">Suggerimento</p>
                <p className="mt-2 leading-6">
                  Usa dati reali o quasi-reali: migliorano suggerimenti, benchmark e la qualità della prima esperienza nel dashboard.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
