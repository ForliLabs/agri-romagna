import Link from "next/link";
import {
  CalendarRange,
  CloudSun,
  MapPinned,
  ScanLine,
  Sprout,
  Tractor,
  Truck,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { cooperativeMembers, farm, fields } from "@/lib/data";

const features = [
  {
    title: "Pianificazione colture",
    description:
      "Semine, trattamenti, irrigazione e finestre agronomiche coordinate appezzamento per appezzamento.",
    Icon: CalendarRange,
  },
  {
    title: "Meteo & Rischi",
    description:
      "Previsioni locali, livelli dei fiumi e alert su grandine, gelo e piena in chiave operativa.",
    Icon: CloudSun,
  },
  {
    title: "Gestione raccolta",
    description:
      "Calendario raccolte, squadre, qualità e volumi attesi per uva, frutta e cereali.",
    Icon: Tractor,
  },
  {
    title: "Logistica cooperativa",
    description:
      "Route condivise, mezzi disponibili e programmazione dei ritiri verso hub e cantina.",
    Icon: Truck,
  },
  {
    title: "Tracciabilità",
    description:
      "Lotti, appezzamenti, note di campo e passaggi chiave della filiera sempre allineati.",
    Icon: ScanLine,
  },
  {
    title: "Vendita diretta",
    description:
      "Ordini locali, disponibilità stagionale e valorizzazione dei prodotti romagnoli in un solo flusso.",
    Icon: Sprout,
  },
];

const pricingTiers = [
  {
    name: "Campo",
    price: "Gratis",
    description: "Per iniziare a digitalizzare un singolo appezzamento.",
    features: ["1 azienda", "Registro attività base", "Meteo locale"],
  },
  {
    name: "Agricoltore",
    price: "€29/mese",
    description:
      "Per aziende agricole che vogliono pianificare e raccogliere meglio.",
    features: ["Campi illimitati", "Raccolte e squadre", "Alert rischio e API dati"],
    highlighted: true,
  },
  {
    name: "Cooperativa",
    price: "€299/mese",
    description: "Per coordinare soci, ritiri, volumi e vendita di filiera.",
    features: ["Multi-azienda", "Route logistiche", "Report aggregati e tracciabilità"],
  },
];

const totalArea = fields.reduce((sum, field) => sum + field.areaHa, 0);

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar
        brand="AgriRomagna"
        items={[
          { label: "Funzionalità", href: "#funzionalita" },
          { label: "Prezzi", href: "#prezzi" },
          { label: "Dashboard", href: "/dashboard" },
        ]}
        ctaLabel="Entra in piattaforma"
        ctaHref="/dashboard"
      />

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-lime-700 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(244,206,138,0.16),transparent_24%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-emerald-50/90">
                <MapPinned className="h-4 w-4" />
                Bertinoro · Forlì · Romagna agricola
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                La spina dorsale digitale per le aziende agricole romagnole
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50/85 sm:text-xl">
                Pianifica, traccia, vendi e proteggi il tuo raccolto da un&apos;unica piattaforma.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="rounded-full bg-[#f4f1e8] px-6 py-3 text-center text-base font-semibold text-emerald-950 transition-transform hover:-translate-y-0.5"
                >
                  Apri la demo operativa
                </Link>
                <Link
                  href="#prezzi"
                  className="rounded-full border border-white/25 px-6 py-3 text-center text-base font-semibold text-white/90 backdrop-blur transition-colors hover:bg-white/10"
                >
                  Vedi i piani
                </Link>
              </div>
            </div>

            <div className="grid gap-4 self-end">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl shadow-emerald-950/20 backdrop-blur">
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-50/70">
                  Operatività oggi
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-black/10 p-4">
                    <p className="text-sm text-emerald-50/70">Azienda pilota</p>
                    <p className="mt-2 text-2xl font-bold">{farm.name}</p>
                  </div>
                  <div className="rounded-2xl bg-black/10 p-4">
                    <p className="text-sm text-emerald-50/70">Superficie gestita</p>
                    <p className="mt-2 text-2xl font-bold">
                      {totalArea.toLocaleString("it-IT")} ha
                    </p>
                  </div>
                  <div className="rounded-2xl bg-black/10 p-4">
                    <p className="text-sm text-emerald-50/70">Appezzamenti attivi</p>
                    <p className="mt-2 text-2xl font-bold">{fields.length}</p>
                  </div>
                  <div className="rounded-2xl bg-black/10 p-4">
                    <p className="text-sm text-emerald-50/70">Soci collegati</p>
                    <p className="mt-2 text-2xl font-bold">
                      {cooperativeMembers.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-3xl border border-emerald-950/10 bg-white/80 p-6 text-sm text-emerald-950/75 shadow-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-emerald-950">Colture reali della Romagna</p>
              <p className="mt-1">
                Sangiovese, Albana, pesche e grano tenero in un quadro operativo unico.
              </p>
            </div>
            <div>
              <p className="font-semibold text-emerald-950">Monitoraggio territoriale</p>
              <p className="mt-1">
                Meteo su Forlì e livelli di Montone e Rabbi per decidere prima e meglio.
              </p>
            </div>
            <div>
              <p className="font-semibold text-emerald-950">Pensato per cooperative</p>
              <p className="mt-1">
                Dalla singola azienda ai ritiri condivisi, senza fogli sparsi o telefonate a vuoto.
              </p>
            </div>
          </div>
        </section>

        <section
          id="funzionalita"
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
        >
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Funzionalità chiave
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
              Tutta la stagione agricola, dal campo alla cooperativa.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map(({ title, description, Icon }) => (
              <article
                key={title}
                className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-emerald-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-emerald-950/70">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="prezzi" className="bg-[#eef3e6] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Prezzi
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
                Un piano per ogni livello della filiera.
              </h2>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {pricingTiers.map((tier) => (
                <article
                  key={tier.name}
                  className={`rounded-3xl border p-8 shadow-sm ${
                    tier.highlighted
                      ? "border-emerald-700 bg-emerald-950 text-white"
                      : "border-emerald-950/10 bg-white text-emerald-950"
                  }`}
                >
                  <p className="text-lg font-semibold">{tier.name}</p>
                  <p
                    className={`mt-3 text-sm ${
                      tier.highlighted ? "text-emerald-50/80" : "text-emerald-950/65"
                    }`}
                  >
                    {tier.description}
                  </p>
                  <p className="mt-6 text-4xl font-black tracking-tight">{tier.price}</p>
                  <ul className="mt-8 space-y-3 text-sm">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span
                          className={`mt-1 h-2.5 w-2.5 rounded-full ${
                            tier.highlighted ? "bg-lime-300" : "bg-emerald-700"
                          }`}
                        />
                        <span
                          className={
                            tier.highlighted ? "text-emerald-50/85" : "text-emerald-950/75"
                          }
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/dashboard"
                    className={`mt-8 inline-flex rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                      tier.highlighted
                        ? "bg-[#f4f1e8] text-emerald-950 hover:bg-white"
                        : "bg-emerald-800 text-white hover:bg-emerald-700"
                    }`}
                  >
                    Inizia ora
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer
        brand="AgriRomagna"
        tagline="Pianificazione, meteo, raccolta e cooperazione digitale per la Romagna agricola."
      />
    </div>
  );
}
