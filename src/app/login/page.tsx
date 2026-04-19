"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sprout, Mail, Lock, Phone, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("agri-token", data.token);
          localStorage.setItem("agri-user", JSON.stringify(data.user));
        }
        router.push("/dashboard");
      } else {
        setError(data.error || "Errore di autenticazione.");
      }
    } catch {
      setError("Errore di connessione. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOTPRequest(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Demo: OTP flow placeholder — in production use Twilio/MessageBird
    setTimeout(() => {
      setLoading(false);
      setError("OTP demo: usa l'accesso email con password 'agriromagna2025'.");
    }, 1000);
  }

  return (
    <div className="flex min-h-screen">
      {/* Left: branding panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-emerald-950 via-green-900 to-lime-700 p-12 text-white lg:flex">
        <div>
          <Link href="/" className="flex items-center gap-3 text-2xl font-bold">
            <Sprout className="h-8 w-8" />
            AgriRomagna
          </Link>
          <p className="mt-2 text-sm text-emerald-50/70">
            Centro operativo cooperativo
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            La piattaforma digitale per
            <br />
            la Romagna agricola.
          </h2>
          <p className="mt-4 max-w-md text-base text-emerald-50/80">
            Accedi per gestire campi, raccolta, meteo, logistica cooperativa e
            tracciabilità della filiera.
          </p>
        </div>
        <p className="text-xs text-emerald-50/50">
          © {new Date().getFullYear()} AgriRomagna
        </p>
      </div>

      {/* Right: login form */}
      <div className="flex flex-1 items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-emerald-950">
              <Sprout className="h-6 w-6" />
              AgriRomagna
            </Link>
          </div>

          <h1 className="mt-8 text-3xl font-bold tracking-tight text-emerald-950 lg:mt-0">
            Accedi al tuo account
          </h1>
          <p className="mt-2 text-sm text-emerald-950/65">
            Scegli come accedere alla piattaforma.
          </p>

          {/* Tab switcher */}
          <div className="mt-8 flex gap-2 rounded-2xl bg-emerald-950/5 p-1">
            <button
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                mode === "email"
                  ? "bg-white text-emerald-950 shadow-sm"
                  : "text-emerald-950/60 hover:text-emerald-950"
              }`}
              onClick={() => setMode("email")}
            >
              <Mail className="mb-0.5 mr-1.5 inline h-4 w-4" />
              Email
            </button>
            <button
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                mode === "otp"
                  ? "bg-white text-emerald-950 shadow-sm"
                  : "text-emerald-950/60 hover:text-emerald-950"
              }`}
              onClick={() => setMode("otp")}
            >
              <Phone className="mb-0.5 mr-1.5 inline h-4 w-4" />
              Telefono (OTP)
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          {mode === "email" ? (
            <form onSubmit={handleEmailLogin} className="mt-6 space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-emerald-950">
                  Email
                </label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-950/40" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marco@tondini.farm"
                    required
                    className="w-full rounded-xl border border-emerald-950/15 bg-white py-3 pl-10 pr-4 text-sm text-emerald-950 placeholder:text-emerald-950/35 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-emerald-950">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-950/40" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-emerald-950/15 bg-white py-3 pl-10 pr-4 text-sm text-emerald-950 placeholder:text-emerald-950/35 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Accesso in corso…" : "Accedi"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOTPRequest} className="mt-6 space-y-5">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-emerald-950">
                  Numero di telefono
                </label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-950/40" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+39 347 123 4567"
                    required
                    className="w-full rounded-xl border border-emerald-950/15 bg-white py-3 pl-10 pr-4 text-sm text-emerald-950 placeholder:text-emerald-950/35 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Invio OTP…" : "Ricevi codice SMS"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          <div className="mt-8 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Account demo
            </p>
            <div className="mt-2 space-y-1 text-sm text-emerald-950/70">
              <p>
                <span className="font-medium text-emerald-950">Email:</span>{" "}
                marco@tondini.farm
              </p>
              <p>
                <span className="font-medium text-emerald-950">Password:</span>{" "}
                agriromagna2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
