import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <WifiOff className="h-10 w-10" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-emerald-950">
          Sei offline
        </h1>
        <p className="mt-4 text-base leading-7 text-emerald-950/70">
          La connessione non è disponibile. I dati salvati localmente sono ancora
          accessibili e le modifiche saranno sincronizzate automaticamente al
          ripristino della rete.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Riprova
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-emerald-950/15 px-6 py-3 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-50"
          >
            Torna alla home
          </Link>
        </div>
        <p className="mt-8 text-xs text-emerald-950/50">
          AgriRomagna funziona offline per le operazioni in campo. Le modifiche
          pendenti verranno inviate con la sincronizzazione in background.
        </p>
      </div>
    </div>
  );
}
