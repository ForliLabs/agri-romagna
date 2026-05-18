"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main"
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
      role="alert"
    >
      <div className="w-full max-w-lg rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-sm shadow-rose-950/5">
        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>

        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">
          Errore
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-rose-950">
          Qualcosa è andato storto
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-rose-900/70">
          Si è verificato un errore imprevisto. Puoi riprovare oppure tornare
          alla pagina principale.
        </p>

        {/* Error digest for support */}
        {error.digest && (
          <p className="mt-4 rounded-xl bg-rose-100/60 px-4 py-2 font-mono text-xs text-rose-800/70">
            Codice errore:{" "}
            <span className="select-all font-semibold">{error.digest}</span>
          </p>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Riprova
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-300 px-5 py-3 text-sm font-semibold text-rose-900 transition hover:bg-rose-100"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Torna alla home
          </Link>
        </div>

        {/* Support hint */}
        <p className="mt-6 text-xs text-rose-800/50">
          Se il problema persiste, contatta il supporto a{" "}
          <a
            href="mailto:cooperativa@agriromagna.it"
            className="underline transition hover:text-rose-800"
          >
            cooperativa@agriromagna.it
          </a>
          {error.digest && " includendo il codice errore qui sopra"}.
        </p>
      </div>
    </main>
  );
}
