import { Route, Truck, UsersRound } from "lucide-react";
import { collectionRoutes, cooperativeMembers, fields } from "@/lib/data";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
});

const totalMemberVolume = cooperativeMembers.reduce(
  (sum, member) => sum + member.expectedVolumeTonnes,
  0
);
const farmVolume = fields.reduce((sum, field) => sum + field.expectedVolume, 0);

export default function CooperativePage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Vista cooperativa
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
          Coordinamento soci, ritiri e volumi aggregati.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-950/70 sm:text-base">
          Quadro unico sulle aziende aderenti, le prossime route di raccolta e la produzione prevista in filiera.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <p className="text-sm text-emerald-950/60">Soci monitorati</p>
          <p className="mt-2 text-3xl font-bold text-emerald-950">{cooperativeMembers.length}</p>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <p className="text-sm text-emerald-950/60">Volume aggregato soci</p>
          <p className="mt-2 text-3xl font-bold text-emerald-950">{totalMemberVolume.toLocaleString("it-IT")} t</p>
        </article>
        <article className="rounded-2xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <p className="text-sm text-emerald-950/60">Volume Azienda Tondini</p>
          <p className="mt-2 text-3xl font-bold text-emerald-950">{farmVolume.toLocaleString("it-IT")} t</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <UsersRound className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Aziende socie</h2>
              <p className="text-sm text-emerald-950/65">Colture e volumi attesi</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {cooperativeMembers.map((member) => (
              <article key={member.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-950">{member.name}</h3>
                    <p className="mt-1 text-sm text-emerald-950/65">{member.location}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                    {member.expectedVolumeTonnes.toLocaleString("it-IT")} t
                  </span>
                </div>
                <p className="mt-4 text-sm text-emerald-950/75">
                  <span className="font-semibold text-emerald-950">Colture:</span> {member.crops.join(", ")}
                </p>
                <p className="mt-2 text-sm text-emerald-950/75">
                  <span className="font-semibold text-emerald-950">Prossimo ritiro:</span>{" "}
                  {dateFormatter.format(new Date(member.nextCollection))}
                </p>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
              <Route className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-950">Piano ritiri</h2>
              <p className="text-sm text-emerald-950/65">Programma route e mezzi</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {collectionRoutes.map((route) => (
              <article key={route.id} className="rounded-2xl border border-emerald-950/10 bg-[#f7f4ec] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      {route.day} · partenza {route.departureTime}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-emerald-950">{route.route}</h3>
                  </div>
                  <div className="rounded-2xl bg-white p-3 text-emerald-800 shadow-sm">
                    <Truck className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-emerald-950/75">
                  <span className="font-semibold text-emerald-950">Mezzo:</span> {route.vehicle}
                </p>
                <p className="mt-2 text-sm text-emerald-950/75">
                  <span className="font-semibold text-emerald-950">Capacità:</span> {route.capacityTonnes.toLocaleString("it-IT")} t
                </p>
                <ul className="mt-4 space-y-2 text-sm text-emerald-950/70">
                  {route.stops.map((stop) => (
                    <li key={stop}>• {stop}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
