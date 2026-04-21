import {
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  ClipboardList,
  Calendar,
  Award,
  FileText,
} from "lucide-react";
import {
  complianceRecords,
  complianceEvents,
  capDeclarations,
  organicCertifications,
  getComplianceSummary,
} from "@/lib/compliance-data";
import { fields } from "@/lib/data";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const fieldMap = new Map(fields.map((f) => [f.id, f]));

const statusClasses: Record<string, string> = {
  conforme: "bg-emerald-50 text-emerald-800",
  in_corso: "bg-amber-100 text-amber-800",
  scaduto: "bg-rose-100 text-rose-800",
  da_completare: "bg-sky-100 text-sky-800",
};

const statusLabels: Record<string, string> = {
  conforme: "Conforme",
  in_corso: "In corso",
  scaduto: "Scaduto",
  da_completare: "Da completare",
};

const typeLabels: Record<string, string> = {
  cap: "PAC",
  organic: "Biologico",
  dop: "DOP",
  igp: "IGP",
};

const summary = getComplianceSummary(complianceRecords);

export default function CompliancePage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Conformità & certificazioni
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          PAC, biologico e denominazioni di origine.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Gestione documentale per le dichiarazioni PAC (AGEA), certificazioni biologiche e
          documentazione DOP/IGP con tracciabilità completa degli eventi.
        </p>
      </section>

      {/* Summary cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <p className="text-sm text-emerald-950/60">Adempimenti totali</p>
          <p className="mt-2 text-3xl font-bold text-emerald-950">{summary.total}</p>
          <p className="mt-2 text-sm font-medium text-emerald-700">
            Tasso di conformità: {summary.completionRate}%
          </p>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <p className="text-sm text-emerald-950/60">Conformi</p>
          <p className="mt-2 text-3xl font-bold text-emerald-800">{summary.conforme}</p>
          <p className="mt-2 text-sm text-emerald-950/55">Documentazione completa</p>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <p className="text-sm text-emerald-950/60">In corso</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{summary.inCorso}</p>
          <p className="mt-2 text-sm text-emerald-950/55">Attesa completamento</p>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <p className="text-sm text-emerald-950/60">Da completare</p>
          <p className="mt-2 text-3xl font-bold text-sky-700">{summary.daCompletare}</p>
          <p className="mt-2 text-sm text-emerald-950/55">Azione richiesta</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Compliance records */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Registro adempimenti</h2>
              <p className="text-sm text-emerald-950/65">PAC, biologico e DOP/IGP</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {complianceRecords.map((record) => (
              <article key={record.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        {typeLabels[record.type]}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses[record.status]}`}>
                        {statusLabels[record.status]}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-emerald-950">{record.title}</h3>
                    <p className="mt-1 text-sm text-emerald-950/65">
                      {fieldMap.get(record.fieldId)?.name} · Scadenza{" "}
                      {dateFormatter.format(new Date(record.dueDate))}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-emerald-950/75">{record.description}</p>
                {record.agencyRef && (
                  <p className="mt-2 text-xs text-emerald-950/50">
                    Protocollo: {record.agencyRef}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {record.documents.map((doc) => (
                    <span key={doc} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm">
                      <FileText className="h-3 w-3" />
                      {doc}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </article>

        {/* Event log */}
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Registro eventi</h2>
              <p className="text-sm text-emerald-950/65">Trattamenti, ispezioni e dichiarazioni</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {complianceEvents.map((event) => (
              <article key={event.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-emerald-950">{event.description}</h3>
                  {event.verified && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      ✓ Verificato
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-emerald-950/70">{event.notes}</p>
                <div className="mt-3 grid gap-2 text-xs text-emerald-950/55 sm:grid-cols-2">
                  <p>
                    <Calendar className="mr-1 inline h-3 w-3" />
                    {dateFormatter.format(new Date(event.date))}
                  </p>
                  <p>Operatore: {event.operator}</p>
                  {event.product && <p>Prodotto: {event.product}</p>}
                  {event.quantity && <p>Dosaggio: {event.quantity}</p>}
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      {/* CAP Declaration & Organic Cert */}
      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Dichiarazione PAC 2026</h2>
              <p className="text-sm text-emerald-950/65">Fascicolo aziendale AGEA</p>
            </div>
          </div>
          {capDeclarations.map((cap) => (
            <div key={cap.id} className="mt-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-emerald-950">
                  Superficie totale: {cap.totalHectares} ha
                </p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[cap.status]}`}>
                  {statusLabels[cap.status]}
                </span>
              </div>
              <p className="mt-2 text-sm text-emerald-700 font-medium">
                Stima sussidio: €{cap.subsidyEstimate.toLocaleString("it-IT")}
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-emerald-950/10 text-sm">
                  <thead className="bg-[#f7f4ec] text-emerald-950/65">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Campo</th>
                      <th className="px-4 py-3 text-left font-semibold">Coltura dichiarata</th>
                      <th className="px-4 py-3 text-left font-semibold">Ha</th>
                      <th className="px-4 py-3 text-left font-semibold">Misura greening</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/10">
                    {cap.fields.map((f) => (
                      <tr key={f.fieldId}>
                        <td className="px-4 py-3 font-medium text-emerald-950">
                          {fieldMap.get(f.fieldId)?.name}
                        </td>
                        <td className="px-4 py-3 text-emerald-950/75">{f.declaredCrop}</td>
                        <td className="px-4 py-3 text-emerald-950/75">{f.hectares}</td>
                        <td className="px-4 py-3 text-emerald-950/75">{f.greeningMeasure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-lime-100 p-3 text-lime-800">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Certificazione biologica</h2>
              <p className="text-sm text-emerald-950/65">Stato e prossimo audit</p>
            </div>
          </div>
          {organicCertifications.map((cert) => (
            <div key={cert.id} className="mt-6 space-y-4">
              <div className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-emerald-950">
                    {cert.certBody} · {cert.certNumber}
                  </h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[cert.status]}`}>
                    {statusLabels[cert.status]}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-emerald-950">Validità:</span>{" "}
                    {dateFormatter.format(new Date(cert.validFrom))} –{" "}
                    {dateFormatter.format(new Date(cert.validTo))}
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Ultimo audit:</span>{" "}
                    {dateFormatter.format(new Date(cert.lastAuditDate))}
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Prossimo audit:</span>{" "}
                    {dateFormatter.format(new Date(cert.nextAuditDate))}
                  </p>
                  <p>
                    <span className="font-semibold text-emerald-950">Colture certificate:</span>{" "}
                    {cert.scope.join(", ")}
                  </p>
                </div>
                {cert.findings.length === 0 ? (
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                    Nessuna non conformità rilevata
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-rose-800">
                      <AlertTriangle className="mr-1 inline h-4 w-4" />
                      Non conformità:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-rose-700">
                      {cert.findings.map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
}
