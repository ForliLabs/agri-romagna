"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/states";

export default function DashboardError({
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
    <ErrorState
      title="Impossibile caricare questo modulo"
      description="Si è verificato un problema durante il caricamento della schermata. Riprova o torna più tardi."
      onRetry={() => unstable_retry()}
    />
  );
}
