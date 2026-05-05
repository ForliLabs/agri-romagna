import {
  CalendarDays,
  FileText,
  Landmark,
  ScrollText,
  UsersRound,
  Vote,
} from "lucide-react";
import { StatCard } from "@/components/dashboard";
import { users } from "@/lib/auth";
import {
  bylawDocuments,
  calculateQuorum,
  getAGMCalendar,
  getMemberProfile,
  getProposals,
  getVotingResults,
} from "@/lib/governance-data";
import { GovernanceCrud } from "./crud";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const proposals = getProposals();
const activeProposals = proposals.filter(
  (proposal) => proposal.status === "open" || proposal.status === "voting"
);
const upcomingAGM = getAGMCalendar()[0]!;
const quorum = calculateQuorum(upcomingAGM?.id);
const memberProfiles = users
  .map((user) => getMemberProfile(user.id))
  .filter((profile): profile is NonNullable<ReturnType<typeof getMemberProfile>> => Boolean(profile));
const participationAverage = Math.round(
  memberProfiles.reduce((total, profile) => total + profile.votingRecord.attendancePercent, 0) /
    memberProfiles.length
);

const statusLabels = {
  draft: "Bozza",
  open: "Aperta",
  voting: "In voto",
  approved: "Approvata",
  rejected: "Respinta",
};

const statusClasses = {
  draft: "bg-slate-100 text-slate-700",
  open: "bg-sky-100 text-sky-800",
  voting: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

const categoryLabels = {
  operational: "Operativa",
  financial: "Finanziaria",
  regulatory: "Regolatoria",
  strategic: "Strategica",
};

export default function GovernancePage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Governance cooperativa
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Proposte, quorum e portale soci in un solo spazio.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Monitoraggio delle deliberazioni, calendario assembleare, partecipazione dei soci e documenti statutari sempre disponibili.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Proposte attive"
          value={String(activeProposals.length)}
          change="Bozze escluse dal conteggio"
          trend="up"
        />
        <StatCard
          label="Votazioni in corso"
          value={String(proposals.filter((proposal) => proposal.status === "voting").length)}
          change="1 scadenza nei prossimi 7 giorni"
          trend="neutral"
        />
        <StatCard
          label="Quorum assemblea"
          value={`${quorum.currentAttendees}/${quorum.requiredMembers}`}
          change={quorum.reached ? "Quorum raggiunto" : "Presenze ancora da confermare"}
          trend={quorum.reached ? "up" : "neutral"}
        />
        <StatCard
          label="Partecipazione media"
          value={`${participationAverage}%`}
          change="Storico presenze soci e deleghe"
          trend="up"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Vote className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Proposte attive</h2>
              <p className="text-sm text-emerald-950/65">Stato avanzamento e risultati parziali</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {activeProposals.map((proposal) => {
              const results = getVotingResults(proposal.id);
              return (
                <article
                  key={proposal.id}
                  className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        {categoryLabels[proposal.category]}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-emerald-950">{proposal.title}</h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[proposal.status]}`}
                    >
                      {statusLabels[proposal.status]}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-emerald-950/75">{proposal.description}</p>
                  <div className="mt-4 grid gap-3 text-sm text-emerald-950/70 md:grid-cols-2">
                    <p>
                      <span className="font-semibold text-emerald-950">Proponente:</span> {proposal.proposedBy}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-950">Scadenza voto:</span>{" "}
                      {dateFormatter.format(new Date(proposal.votingDeadline))}
                    </p>
                  </div>
                  <div className="mt-5 rounded-2xl border border-emerald-950/10 bg-white p-4">
                    <div className="flex items-center justify-between gap-3 text-sm text-emerald-950/70">
                      <span>Partecipazione {results.participationRate}%</span>
                      <span>{results.totalVotes} voti raccolti</span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-emerald-950/10">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${results.favorPercent}%` }}
                      />
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-emerald-950/60 sm:grid-cols-3">
                      <p>Favorevoli {results.favor}</p>
                      <p>Contrari {results.against}</p>
                      <p>Astenuti {results.abstain}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Prossima assemblea</h2>
                <p className="text-sm text-emerald-950/65">Calendario AGM e ordine del giorno</p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
              <h3 className="text-lg font-semibold text-emerald-950">{upcomingAGM.title}</h3>
              <p className="mt-2 text-sm text-emerald-950/70">
                {dateFormatter.format(new Date(upcomingAGM.date))} · {upcomingAGM.location}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-emerald-950/75">
                {upcomingAGM.agendaItems.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </article>

          <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-950">Tracker quorum</h2>
                <p className="text-sm text-emerald-950/65">Presenze confermate vs minimo richiesto</p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-emerald-950">Copertura quorum</p>
                <span className="text-sm font-semibold text-emerald-700">{quorum.progressPercent}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-emerald-950/10">
                <div
                  className={`h-full rounded-full ${quorum.reached ? "bg-emerald-600" : "bg-amber-500"}`}
                  style={{ width: `${quorum.progressPercent}%` }}
                />
              </div>
              <div className="mt-4 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-emerald-950">Soci richiesti:</span> {quorum.requiredMembers}
                </p>
                <p>
                  <span className="font-semibold text-emerald-950">Presenze confermate:</span> {quorum.currentAttendees}
                </p>
                <p>
                  <span className="font-semibold text-emerald-950">Base sociale:</span> {quorum.totalMembers}
                </p>
                <p>
                  <span className="font-semibold text-emerald-950">Tasso presenze:</span> {quorum.attendanceRate}%
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <UsersRound className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Partecipazione soci</h2>
              <p className="text-sm text-emerald-950/65">Presenze assembleari, voti e liquidazioni</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {memberProfiles.map((profile) => {
              const latestSettlement = profile.settlementHistory[profile.settlementHistory.length - 1];
              return (
                <article
                  key={profile.id}
                  className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-950">{profile.name}</h3>
                      <p className="mt-1 text-sm text-emerald-950/65">
                        {profile.role} · ingresso {dateFormatter.format(new Date(profile.joinDate))}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                      {profile.productionVolumeTonnes.toLocaleString("it-IT")} t
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-emerald-950/75 sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-emerald-950">Appezzamenti:</span> {profile.fieldsCount}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-950">Proposte votate:</span>{" "}
                      {profile.votingRecord.proposalsVoted}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-950">Presenza AGM:</span>{" "}
                      {profile.votingRecord.attendancePercent}%
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-950">Deleghe gestite:</span>{" "}
                      {profile.votingRecord.proxyVotesGiven}
                    </p>
                  </div>
                  <p className="mt-4 text-sm text-emerald-950/70">
                    <span className="font-semibold text-emerald-950">Prossima liquidazione:</span>{" "}
                    {latestSettlement.referencePeriod} · € {latestSettlement.amountEur.toLocaleString("it-IT")}
                  </p>
                </article>
              );
            })}
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <ScrollText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Documenti statutari</h2>
              <p className="text-sm text-emerald-950/65">Versioni efficaci e sintesi operative</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {bylawDocuments.map((document) => (
              <article
                key={document.id}
                className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-950">{document.title}</h3>
                    <p className="mt-1 text-sm text-emerald-950/60">Versione {document.version}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 text-emerald-800 shadow-sm">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-emerald-950/75">{document.summary}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-emerald-950/50">
                  In vigore dal {dateFormatter.format(new Date(document.effectiveDate))}
                </p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <GovernanceCrud />
    </div>
  );
}