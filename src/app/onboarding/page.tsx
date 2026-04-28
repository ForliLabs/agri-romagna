"use client";

import { useState } from "react";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { id: 1, label: "Cooperativa", description: "Dati della cooperativa" },
  { id: 2, label: "Amministratore", description: "Account admin" },
  { id: 3, label: "Aziende", description: "Registra le aziende" },
  { id: 4, label: "Campi", description: "Aggiungi appezzamenti" },
  { id: 5, label: "Membri", description: "Invita i membri" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

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

  const [farms, setFarms] = useState([
    { name: "", location: "", hectares: 0, specialty: "" },
  ]);

  const [fields, setFields] = useState([
    { name: "", crop: "", areaHa: 0, farmIndex: 0, status: "Registrato", plantingDate: "" },
  ]);

  const [members, setMembers] = useState([
    { name: "", email: "", role: "farm_manager", farmIndex: 0 },
  ]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cooperative,
          admin,
          farms: farms.filter((f) => f.name),
          fields: fields.filter((f) => f.name && f.crop),
          members: members.filter((m) => m.name && m.email),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore durante la configurazione.");
        return;
      }

      setComplete(true);
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  if (complete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eff3ea] p-4">
        <div className="w-full max-w-lg rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-lg">
          <div className="mb-4 text-5xl">🌱</div>
          <h1 className="text-2xl font-bold text-emerald-900">Benvenuto in AgriRomagna!</h1>
          <p className="mt-3 text-emerald-700">
            La cooperativa <strong>{cooperative.name}</strong> è stata creata con successo.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Accedi al dashboard →
            </Link>
            <button
              onClick={async () => {
                await fetch("/api/onboarding", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "generate-sample-data", cooperativeId: cooperative.name }),
                });
              }}
              className="rounded-xl border border-emerald-200 px-6 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              Genera dati demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#eff3ea]">
      {/* Header */}
      <header className="border-b border-emerald-200 bg-white/80 px-4 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="text-lg font-bold text-emerald-900">🌱 AgriRomagna — Configurazione</h1>
          <Link href="/" className="text-sm text-emerald-600 hover:underline">
            Torna alla home
          </Link>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-emerald-100 bg-white px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto">
          {STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id as Step)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                step === s.id
                  ? "bg-emerald-700 text-white"
                  : step > s.id
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                {step > s.id ? "✓" : s.id}
              </span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Cooperative */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-emerald-900">Dati della Cooperativa</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-emerald-800">Nome cooperativa *</label>
                  <input
                    type="text"
                    value={cooperative.name}
                    onChange={(e) => setCooperative({ ...cooperative, name: e.target.value })}
                    className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                    placeholder="es. Cooperativa Romagna Unita"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-emerald-800">Regione *</label>
                  <input
                    type="text"
                    value={cooperative.region}
                    onChange={(e) => setCooperative({ ...cooperative, region: e.target.value })}
                    className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-emerald-800">Provincia *</label>
                  <input
                    type="text"
                    value={cooperative.province}
                    onChange={(e) => setCooperative({ ...cooperative, province: e.target.value })}
                    className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                    placeholder="es. Forlì-Cesena"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-emerald-800">Piano</label>
                  <select
                    value={cooperative.plan}
                    onChange={(e) => setCooperative({ ...cooperative, plan: e.target.value })}
                    className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                  >
                    <option value="campo">Campo (base)</option>
                    <option value="agricoltore">Agricoltore (standard)</option>
                    <option value="cooperativa">Cooperativa (completo)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Admin */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-emerald-900">Account Amministratore</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-emerald-800">Nome completo *</label>
                  <input
                    type="text"
                    value={admin.name}
                    onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                    className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-emerald-800">Email *</label>
                  <input
                    type="email"
                    value={admin.email}
                    onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                    className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-emerald-800">Password *</label>
                  <input
                    type="password"
                    value={admin.password}
                    onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
                    className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-emerald-800">Telefono</label>
                  <input
                    type="tel"
                    value={admin.phone}
                    onChange={(e) => setAdmin({ ...admin, phone: e.target.value })}
                    className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Farms */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-emerald-900">Aziende Agricole</h2>
                <button
                  onClick={() => setFarms([...farms, { name: "", location: "", hectares: 0, specialty: "" }])}
                  className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700"
                >
                  + Aggiungi azienda
                </button>
              </div>
              {farms.map((farm, i) => (
                <div key={i} className="rounded-lg border border-emerald-100 bg-white p-4">
                  <p className="mb-3 text-sm font-semibold text-emerald-800">Azienda {i + 1}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Nome azienda"
                      value={farm.name}
                      onChange={(e) => {
                        const updated = [...farms];
                        updated[i] = { ...farm, name: e.target.value };
                        setFarms(updated);
                      }}
                      className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Località"
                      value={farm.location}
                      onChange={(e) => {
                        const updated = [...farms];
                        updated[i] = { ...farm, location: e.target.value };
                        setFarms(updated);
                      }}
                      className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Ettari"
                      value={farm.hectares || ""}
                      onChange={(e) => {
                        const updated = [...farms];
                        updated[i] = { ...farm, hectares: parseFloat(e.target.value) || 0 };
                        setFarms(updated);
                      }}
                      className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Specialità"
                      value={farm.specialty}
                      onChange={(e) => {
                        const updated = [...farms];
                        updated[i] = { ...farm, specialty: e.target.value };
                        setFarms(updated);
                      }}
                      className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Fields */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-emerald-900">Appezzamenti</h2>
                <button
                  onClick={() => setFields([...fields, { name: "", crop: "", areaHa: 0, farmIndex: 0, status: "Registrato", plantingDate: "" }])}
                  className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700"
                >
                  + Aggiungi campo
                </button>
              </div>
              {fields.map((field, i) => (
                <div key={i} className="rounded-lg border border-emerald-100 bg-white p-4">
                  <p className="mb-3 text-sm font-semibold text-emerald-800">Campo {i + 1}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Nome campo"
                      value={field.name}
                      onChange={(e) => {
                        const updated = [...fields];
                        updated[i] = { ...field, name: e.target.value };
                        setFields(updated);
                      }}
                      className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Coltura"
                      value={field.crop}
                      onChange={(e) => {
                        const updated = [...fields];
                        updated[i] = { ...field, crop: e.target.value };
                        setFields(updated);
                      }}
                      className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Area (ha)"
                      value={field.areaHa || ""}
                      onChange={(e) => {
                        const updated = [...fields];
                        updated[i] = { ...field, areaHa: parseFloat(e.target.value) || 0 };
                        setFields(updated);
                      }}
                      className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                    />
                    <select
                      value={field.farmIndex}
                      onChange={(e) => {
                        const updated = [...fields];
                        updated[i] = { ...field, farmIndex: parseInt(e.target.value) };
                        setFields(updated);
                      }}
                      className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                    >
                      {farms.map((f, fi) => (
                        <option key={fi} value={fi}>
                          {f.name || `Azienda ${fi + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 5: Members */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-emerald-900">Invita Membri</h2>
                <button
                  onClick={() => setMembers([...members, { name: "", email: "", role: "farm_manager", farmIndex: 0 }])}
                  className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700"
                >
                  + Aggiungi membro
                </button>
              </div>
              <p className="text-sm text-emerald-700">
                I membri riceveranno la password temporanea: <code className="rounded bg-emerald-100 px-1">agriromagna2025</code>
              </p>
              {members.map((member, i) => (
                <div key={i} className="rounded-lg border border-emerald-100 bg-white p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={member.name}
                      onChange={(e) => {
                        const updated = [...members];
                        updated[i] = { ...member, name: e.target.value };
                        setMembers(updated);
                      }}
                      className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={member.email}
                      onChange={(e) => {
                        const updated = [...members];
                        updated[i] = { ...member, email: e.target.value };
                        setMembers(updated);
                      }}
                      className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                    />
                    <select
                      value={member.role}
                      onChange={(e) => {
                        const updated = [...members];
                        updated[i] = { ...member, role: e.target.value };
                        setMembers(updated);
                      }}
                      className="rounded-lg border border-emerald-200 px-3 py-2 text-sm"
                    >
                      <option value="farm_manager">Responsabile azienda</option>
                      <option value="agronomist">Agronomo</option>
                      <option value="seasonal_worker">Operaio stagionale</option>
                      <option value="viewer">Osservatore</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1) as Step)}
              disabled={step === 1}
              className="rounded-xl border border-emerald-200 px-6 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
            >
              ← Indietro
            </button>

            {step < 5 ? (
              <button
                onClick={() => setStep(Math.min(5, step + 1) as Step)}
                className="rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Avanti →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-xl bg-emerald-700 px-8 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {loading ? "Creazione in corso..." : "Crea cooperativa ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
