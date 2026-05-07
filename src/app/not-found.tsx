import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
        Errore 404
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-emerald-950">
        Pagina non trovata
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-emerald-950/70">
        La risorsa richiesta non esiste o è stata spostata. Controlla
        l&apos;indirizzo oppure torna alla pagina principale.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        Torna alla home
      </Link>
    </div>
  );
}
