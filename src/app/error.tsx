"use client";

import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";

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
    <main id="main" className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center" role="alert">
      <div className="w-full max-w-lg rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-sm shadow-rose-950/5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">
          Errore
        </p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-rose-950">
          Qualcosa è andato storto
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-rose-900/70">
          Si è verificato un errore imprevisto. Puoi riprovare oppure tornare
          alla pagina principale.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          Riprova
        </button>
      </div>
    </main>
  );
}
