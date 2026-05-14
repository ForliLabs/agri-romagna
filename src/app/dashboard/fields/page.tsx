import Link from "next/link";
import { ArrowRight, CalendarClock, Radio, Satellite, Sprout, Trees } from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { FieldMapPreview } from "@/components/field-map-preview";
import { fields, weatherData } from "@/lib/data";
import { fieldOperationalPriorities, iotAreaHealth } from "@/lib/operations-insights";
import { FieldsCrud } from "./crud";

const fullDateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const priorityLookup = new Map(fieldOperationalPriorities.map((item) => [item.fieldId, item]));

export default function FieldsPage() {
  const now = new Date(weatherData.current.observedAt);
  const harvestReadyFields = fields.filter((field) => {
    const daysUntilHarvest = Math.ceil(
      (new Date(field.expectedHarvest).getTime() - now.getTime()) /
        (24 * 60 * 60 * 1000)
    );
    return daysUntilHarvest <= 45;
  }).length;

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Gestione campi</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Catasto operativo degli appezzamenti.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Vista combinata su superfici, colture, stato vegetativo e prossime finestre di intervento.
          In questa iterazione ogni appezzamento evidenzia anche il prossimo passo operativo.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Campi monitorati" value={String(fields.length)} change="Catasto operativo sincronizzato" trend="up" />
        <StatCard
          label="Azioni prioritarie"
          value={String(fieldOperationalPriorities.filter((item) => item.severity !== "bassa").length)}
          change="Campi con intervento da chiudere"
          trend="down"
        />
        <StatCard label="Raccolte in avvicinamento" value={String(harvestReadyFields)} change="Entro i prossimi 45 giorni" trend="up" />
        <StatCard
          label="Aree con sensori"
          value={String(iotAreaHealth.length)}
          change="Presidi IoT e trasporto monitorati"
          trend="neutral"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Priorità di oggi</h2>
              <p className="text-sm text-emerald-950/65">Task da chiudere prima di confermare meteo, raccolta e logistica</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {fieldOperationalPriorities.map((item) => (
              <article key={item.fieldId} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-emerald-950">{item.fieldName}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.severity === "alta"
                            ? "bg-rose-100 text-rose-700"
                            : item.severity === "media"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-50 text-emerald-800"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-emerald-950">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-emerald-950/70">{item.detail}</p>
                  </div>
                  <div className="text-sm text-emerald-950/70 sm:text-right">
                    <p className="font-semibold text-emerald-950">{item.dueLabel}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-emerald-950/45">
                      {item.relatedModules.join(" · ")}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/weather"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Allinea con il meteo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/harvest"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-950/10 bg-white px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:border-emerald-700/30 hover:text-emerald-700"
            >
              Apri piano raccolta
            </Link>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Satellite className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Overlay e contesto di campo</h2>
              <p className="text-sm text-emerald-950/65">Confini, vigore NDVI e prossima area che richiede presidio</p>
            </div>
          </div>
          <div className="mt-6">
            <FieldMapPreview />
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
        <div className="border-b border-emerald-950/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Trees className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Elenco campi</h2>
              <p className="text-sm text-emerald-950/65">Nome, coltura, superficie, stato e prossimo passo condiviso con i moduli operativi</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-950/10 text-left text-sm">
            <thead className="bg-[#f7f4ec] text-emerald-950/65">
              <tr>
                <th className="px-6 py-4 font-semibold">Campo</th>
                <th className="px-6 py-4 font-semibold">Coltura</th>
                <th className="px-6 py-4 font-semibold">Area (ha)</th>
                <th className="px-6 py-4 font-semibold">Stato</th>
                <th className="px-6 py-4 font-semibold">Raccolta stimata</th>
                <th className="px-6 py-4 font-semibold">Prossima azione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {fields.map((field) => {
                const priority = priorityLookup.get(field.id);
                return (
                  <tr key={field.id}>
                    <td className="px-6 py-4 font-semibold text-emerald-950">
                      <Link href={`/dashboard/fields/${field.id}`} className="hover:text-emerald-700 hover:underline">
                        {field.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">{field.crop}</td>
                    <td className="px-6 py-4 text-emerald-950/75">{field.areaHa.toLocaleString("it-IT")}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                        {field.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      {fullDateFormatter.format(new Date(field.expectedHarvest))}
                    </td>
                    <td className="px-6 py-4 text-emerald-950/75">
                      <p className="font-semibold text-emerald-950">{priority?.title ?? "Monitoraggio di routine"}</p>
                      <p className="mt-1 text-xs text-emerald-950/55">{priority?.dueLabel ?? "Settimanale"}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Schede di dettaglio</h2>
            <p className="text-sm text-emerald-950/65">Vista operativa con contesto agronomico, raccolta e presidio sensori</p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {fields.map((field) => {
            const priority = priorityLookup.get(field.id);
            return (
              <article
                key={field.id}
                className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-emerald-950">
                      <Link href={`/dashboard/fields/${field.id}`} className="hover:text-emerald-700 hover:underline">
                        {field.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-emerald-950/70">
                      {field.crop} · {field.municipality}
                    </p>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {field.areaHa.toLocaleString("it-IT")} ha
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-emerald-950/10 bg-[linear-gradient(135deg,rgba(22,101,52,0.08),rgba(187,247,208,0.16))] p-5 text-sm text-emerald-900/75">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
                      <Satellite className="h-6 w-6 text-emerald-700" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-950">Piano operativo condiviso</p>
                      <p className="mt-2 leading-6">{priority?.detail ?? field.health}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-emerald-950">Raccolta stimata:</span>{" "}
                    {fullDateFormatter.format(new Date(field.expectedHarvest))}
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Salute:</span> {field.health}
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Irrigazione:</span> {field.irrigation}
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Task corrente:</span> {priority?.dueLabel ?? "Monitoraggio"}
                  </p>
                </div>

                <div className="mt-5 rounded-2xl bg-[#f7f4ec] p-4 text-sm leading-6 text-emerald-950/75">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-emerald-950">
                    <Radio className="h-4 w-4" />
                    Moduli da coordinare
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(priority?.relatedModules ?? ["Campi", "Meteo"]).map((module) => (
                      <span key={module} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-emerald-800 shadow-sm">
                        {module}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3">{field.notes}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <FieldsCrud />
    </div>
  );
}