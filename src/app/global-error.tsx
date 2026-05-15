"use client";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="it">
      <body className="flex min-h-screen items-center justify-center bg-[#eff3ea] px-4 text-emerald-950">
        <main id="main" role="alert" className="w-full max-w-lg rounded-3xl border border-emerald-950/10 bg-white p-8 text-center shadow-xl shadow-emerald-950/10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Errore applicativo
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Qualcosa è andato storto</h1>
          <p className="mt-3 text-sm leading-7 text-emerald-950/70">
            La piattaforma ha incontrato un problema imprevisto. Puoi riprovare subito oppure ricaricare la pagina.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="mt-6 rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Riprova
          </button>
        </main>
      </body>
    </html>
  );
}
