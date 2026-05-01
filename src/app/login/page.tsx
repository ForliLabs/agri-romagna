"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, Phone, Sprout } from "lucide-react";
import { readApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast-provider";

const isDevelopment = process.env.NODE_ENV !== "production";

type Mode = "email" | "otp";
type LoadingState = "idle" | "email" | "requestOtp" | "verifyOtp";

type FieldErrors = Partial<Record<"email" | "password" | "phone" | "otpCode", string>>;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  return value.replace(/\D/g, "").length >= 9;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = useMemo(() => searchParams.get("redirect") || "/dashboard", [searchParams]);
  const { pushToast } = useToast();

  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [banner, setBanner] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");

  const validateEmailFields = () => {
    const nextErrors: FieldErrors = {};
    if (!email.trim()) nextErrors.email = "Inserisci la tua email aziendale.";
    else if (!isValidEmail(email)) nextErrors.email = "L'indirizzo email non è valido.";

    if (!password.trim()) nextErrors.password = "Inserisci la password.";
    else if (password.trim().length < 8) nextErrors.password = "La password deve avere almeno 8 caratteri.";

    return nextErrors;
  };

  const validateOtpFields = (phase: "request" | "verify") => {
    const nextErrors: FieldErrors = {};

    if (!phone.trim()) nextErrors.phone = "Inserisci il numero di telefono associato all'account.";
    else if (!isValidPhone(phone)) nextErrors.phone = "Inserisci un numero di telefono valido.";

    if (phase === "verify") {
      if (!otpCode.trim()) nextErrors.otpCode = "Inserisci il codice ricevuto via SMS demo.";
      else if (!/^\d{6}$/.test(otpCode.trim())) nextErrors.otpCode = "Il codice OTP deve contenere 6 cifre.";
    }

    return nextErrors;
  };

  function setSingleFieldError(field: keyof FieldErrors, value: string) {
    const nextErrors =
      field === "email" || field === "password"
        ? validateEmailFields()
        : validateOtpFields(field === "otpCode" ? "verify" : otpRequested ? "verify" : "request");

    setFieldErrors((current) => ({ ...current, [field]: nextErrors[field] }));
    if (value && banner) setBanner("");
  }

  function resetMode(nextMode: Mode) {
    setMode(nextMode);
    setBanner("");
    setFieldErrors({});
    if (nextMode === "email") {
      setOtpRequested(false);
      setOtpCode("");
    }
  }

  async function handleEmailLogin(event: React.FormEvent) {
    event.preventDefault();
    const errors = validateEmailFields();
    setFieldErrors(errors);
    setBanner("");
    if (Object.keys(errors).length > 0) return;

    setLoadingState("email");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setBanner(await readApiError(response));
        return;
      }

      pushToast({
        variant: "success",
        title: "Accesso riuscito",
        message: "Benvenuto in AgriRomagna. Stiamo aprendo il tuo dashboard.",
      });
      router.push(redirectPath);
    } catch {
      setBanner("Errore di connessione. Verifica la rete e riprova.");
    } finally {
      setLoadingState("idle");
    }
  }

  async function handleOtpRequest(event: React.FormEvent) {
    event.preventDefault();
    const errors = validateOtpFields("request");
    setFieldErrors(errors);
    setBanner("");
    if (Object.keys(errors).length > 0) return;

    setLoadingState("requestOtp");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-otp", phone }),
      });

      if (!response.ok) {
        setBanner(await readApiError(response));
        return;
      }

      const payload = (await response.json()) as { message?: string; devCode?: string };
      setOtpRequested(true);
      setBanner(payload.message || "Codice OTP inviato con successo.");
      pushToast({
        variant: "info",
        title: "Codice inviato",
        message: payload.devCode
          ? `Ambiente demo: usa il codice ${payload.devCode}.`
          : "Controlla l'SMS e completa l'accesso entro 5 minuti.",
      });
    } catch {
      setBanner("Impossibile inviare il codice OTP. Riprova tra qualche istante.");
    } finally {
      setLoadingState("idle");
    }
  }

  async function handleOtpVerify(event: React.FormEvent) {
    event.preventDefault();
    const errors = validateOtpFields("verify");
    setFieldErrors(errors);
    setBanner("");
    if (Object.keys(errors).length > 0) return;

    setLoadingState("verifyOtp");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-otp", phone, code: otpCode }),
      });

      if (!response.ok) {
        setBanner(await readApiError(response));
        return;
      }

      pushToast({
        variant: "success",
        title: "Accesso OTP riuscito",
        message: "Accesso confermato. Stiamo aprendo il dashboard operativo.",
      });
      router.push(redirectPath);
    } catch {
      setBanner("Errore di connessione. Verifica la rete e riprova.");
    } finally {
      setLoadingState("idle");
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-emerald-950 via-green-900 to-lime-700 p-12 text-white lg:flex">
        <div>
          <Link href="/" className="flex items-center gap-3 text-2xl font-bold">
            <Sprout className="h-8 w-8" aria-hidden="true" />
            AgriRomagna
          </Link>
          <p className="mt-2 text-sm text-emerald-50/70">Centro operativo cooperativo</p>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            La piattaforma digitale per
            <br />
            la Romagna agricola.
          </h2>
          <p className="mt-4 max-w-md text-base text-emerald-50/80">
            Accedi per gestire campi, raccolta, meteo, logistica cooperativa e tracciabilità della filiera.
          </p>
          <div className="mt-8 grid gap-4 text-sm text-emerald-50/80">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="font-semibold">Prima volta su AgriRomagna?</p>
              <p className="mt-2 leading-6">Completa la configurazione guidata per creare cooperativa, aziende, campi e membri in pochi minuti.</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-emerald-50/50">© {new Date().getFullYear()} AgriRomagna</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-lg rounded-[2rem] border border-emerald-950/10 bg-white/85 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur sm:p-8">
          <div className="lg:hidden">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-emerald-950">
              <Sprout className="h-6 w-6" aria-hidden="true" />
              AgriRomagna
            </Link>
          </div>

          <div className="mt-8 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-emerald-950">Accedi al tuo account</h1>
            <p className="mt-2 text-sm leading-6 text-emerald-950/65">
              Scegli il flusso di accesso più adatto. Le credenziali vengono gestite in modo sicuro tramite cookie di sessione.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-emerald-950/5 p-1" role="tablist" aria-label="Metodi di accesso">
            <div className="grid grid-cols-2 gap-2">
              <button
                id="login-tab-email"
                role="tab"
                type="button"
                aria-selected={mode === "email"}
                aria-controls="login-panel-email"
                tabIndex={mode === "email" ? 0 : -1}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                  mode === "email" ? "bg-white text-emerald-950 shadow-sm" : "text-emerald-950/60 hover:text-emerald-950"
                )}
                onClick={() => resetMode("email")}
              >
                <Mail className="mb-0.5 mr-1.5 inline h-4 w-4" aria-hidden="true" />
                Email
              </button>
              <button
                id="login-tab-otp"
                role="tab"
                type="button"
                aria-selected={mode === "otp"}
                aria-controls="login-panel-otp"
                tabIndex={mode === "otp" ? 0 : -1}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                  mode === "otp" ? "bg-white text-emerald-950 shadow-sm" : "text-emerald-950/60 hover:text-emerald-950"
                )}
                onClick={() => resetMode("otp")}
              >
                <Phone className="mb-0.5 mr-1.5 inline h-4 w-4" aria-hidden="true" />
                Telefono (OTP)
              </button>
            </div>
          </div>

          {banner ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
              {banner}
            </div>
          ) : null}

          {mode === "email" ? (
            <form
              id="login-panel-email"
              role="tabpanel"
              aria-labelledby="login-tab-email"
              onSubmit={handleEmailLogin}
              className="mt-6 space-y-5"
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-emerald-950">
                  Email
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-950/40" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onBlur={(event) => setSingleFieldError("email", event.target.value)}
                    placeholder="marco@tondini.farm"
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                    className={cn(
                      "w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-emerald-950 placeholder:text-emerald-950/35",
                      fieldErrors.email ? "border-rose-300" : "border-emerald-950/15"
                    )}
                  />
                </div>
                {fieldErrors.email ? (
                  <p id="email-error" className="mt-2 text-sm text-rose-700">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-emerald-950">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-950/40" aria-hidden="true" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onBlur={(event) => setSingleFieldError("password", event.target.value)}
                    placeholder="••••••••"
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
                    className={cn(
                      "w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-emerald-950 placeholder:text-emerald-950/35",
                      fieldErrors.password ? "border-rose-300" : "border-emerald-950/15"
                    )}
                  />
                </div>
                <p id="password-hint" className="mt-2 text-sm text-emerald-950/55">
                  Usa la password del tuo account cooperativa o del profilo demo di sviluppo.
                </p>
                {fieldErrors.password ? (
                  <p id="password-error" className="mt-2 text-sm text-rose-700">
                    {fieldErrors.password}
                  </p>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={loadingState !== "idle"}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingState === "email" ? "Accesso in corso…" : "Accedi"}
                {loadingState !== "email" ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
              </button>
            </form>
          ) : (
            <form
              id="login-panel-otp"
              role="tabpanel"
              aria-labelledby="login-tab-otp"
              onSubmit={otpRequested ? handleOtpVerify : handleOtpRequest}
              className="mt-6 space-y-5"
            >
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-emerald-950">
                  Numero di telefono
                </label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-950/40" aria-hidden="true" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    onBlur={(event) => setSingleFieldError("phone", event.target.value)}
                    placeholder="+39 347 123 4567"
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={fieldErrors.phone ? "phone-error" : "phone-hint"}
                    className={cn(
                      "w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-emerald-950 placeholder:text-emerald-950/35",
                      fieldErrors.phone ? "border-rose-300" : "border-emerald-950/15"
                    )}
                  />
                </div>
                <p id="phone-hint" className="mt-2 text-sm text-emerald-950/55">
                  Il codice OTP demo viene valido per 5 minuti e apre direttamente il dashboard.
                </p>
                {fieldErrors.phone ? (
                  <p id="phone-error" className="mt-2 text-sm text-rose-700">
                    {fieldErrors.phone}
                  </p>
                ) : null}
              </div>

              {otpRequested ? (
                <div>
                  <label htmlFor="otpCode" className="block text-sm font-medium text-emerald-950">
                    Codice OTP
                  </label>
                  <input
                    id="otpCode"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    onBlur={(event) => setSingleFieldError("otpCode", event.target.value)}
                    placeholder="123456"
                    aria-invalid={Boolean(fieldErrors.otpCode)}
                    aria-describedby={fieldErrors.otpCode ? "otp-error" : undefined}
                    className={cn(
                      "mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-center text-lg font-semibold tracking-[0.5em] text-emerald-950",
                      fieldErrors.otpCode ? "border-rose-300" : "border-emerald-950/15"
                    )}
                  />
                  {fieldErrors.otpCode ? (
                    <p id="otp-error" className="mt-2 text-sm text-rose-700">
                      {fieldErrors.otpCode}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loadingState !== "idle"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingState === "requestOtp"
                    ? "Invio OTP…"
                    : loadingState === "verifyOtp"
                      ? "Verifica in corso…"
                      : otpRequested
                        ? "Verifica e accedi"
                        : "Ricevi codice SMS"}
                  {loadingState === "idle" ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
                </button>
                {otpRequested ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOtpRequested(false);
                      setOtpCode("");
                      setBanner("");
                    }}
                    className="rounded-xl border border-emerald-950/10 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-50"
                  >
                    Modifica numero
                  </button>
                ) : null}
              </div>
            </form>
          )}

          <div className="mt-8 grid gap-3 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4 text-sm text-emerald-950/70 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Primo accesso
              </p>
              <p className="mt-2 leading-6">Configura cooperativa, aziende, campi e membri con il percorso guidato di onboarding.</p>
            </div>
            <div className="flex items-center sm:justify-end">
              <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-emerald-950 shadow-sm transition hover:bg-emerald-50">
                Avvia configurazione
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {isDevelopment ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950/80">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Ambiente di sviluppo</p>
              <p className="mt-2">Usa il seed locale per i test: email <strong>marco@tondini.farm</strong>, password <strong>agriromagna2025</strong>, telefono <strong>+39 347 123 4567</strong>.</p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center bg-background text-sm text-emerald-700">Caricamento accesso…</div>}
    >
      <LoginPageContent />
    </Suspense>
  );
}
