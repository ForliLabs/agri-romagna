import { Satellite, Sprout, Trees } from "lucide-react";
import { fields } from "@/lib/data";

const fullDateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default function FieldsPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Gestione campi</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Catasto operativo degli appezzamenti.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Vista combinata su superfici, colture, stato vegetativo e prossime finestre di intervento.
        </p>
      </section>

      <section className="overflow-hidden rounded-3xl border border-emerald-950/10 bg-white/90 shadow-sm shadow-emerald-950/5">
        <div className="border-b border-emerald-950/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Trees className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-950">Elenco campi</h2>
              <p className="text-sm text-emerald-950/65">Nome, coltura, superficie, stato e data di impianto/semina</p>
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
                <th className="px-6 py-4 font-semibold">Data di impianto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/10 bg-white">
              {fields.map((field) => (
                <tr key={field.id}>
                  <td className="px-6 py-4 font-semibold text-emerald-950">{field.name}</td>
                  <td className="px-6 py-4 text-emerald-950/75">{field.crop}</td>
                  <td className="px-6 py-4 text-emerald-950/75">{field.areaHa.toLocaleString("it-IT")}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                      {field.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-emerald-950/75">
                    {fullDateFormatter.format(new Date(field.plantingDate))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
            <Satellite className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-950">Schede di dettaglio</h2>
            <p className="text-sm text-emerald-950/65">Con placeholder per vista satellitare e indicatori NDVI</p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {fields.map((field) => (
            <article
              key={field.id}
              className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-emerald-950">{field.name}</h3>
                  <p className="mt-1 text-sm text-emerald-950/70">
                    {field.crop} · {field.municipality}
                  </p>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {field.areaHa.toLocaleString("it-IT")} ha
                </div>
              </div>

              <div className="mt-5 flex h-44 items-center justify-center rounded-3xl border border-dashed border-emerald-700/30 bg-[linear-gradient(135deg,rgba(22,101,52,0.12),rgba(187,247,208,0.12))] text-center text-sm font-medium text-emerald-900/70">
                <div>
                  <Satellite className="mx-auto h-8 w-8" />
                  <p className="mt-3">Placeholder vista satellitare / vigore vegetativo</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em]">Aggiornamento indice campo previsto ogni 24h</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-emerald-950">Stato:</span> {field.status}
                </p>
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
              </div>

              <div className="mt-5 rounded-2xl bg-[#f7f4ec] p-4 text-sm leading-6 text-emerald-950/75">
                <div className="mb-2 flex items-center gap-2 font-semibold text-emerald-950">
                  <Sprout className="h-4 w-4" />
                  Nota di campo
                </div>
                {field.notes}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
