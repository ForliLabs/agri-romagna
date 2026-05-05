import { AlertCircle, Inbox, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("rounded-2xl skeleton-shimmer", className)} aria-hidden="true" />;
}

export function PageSkeleton({ cards = 4, rows = 3 }: { cards?: number; rows?: number }) {
  return (
    <div className="space-y-8" aria-hidden="true">
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-40" />
        <SkeletonBlock className="h-10 w-96 max-w-full" />
        <SkeletonBlock className="h-4 w-[36rem] max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="mt-4 h-8 w-24" />
            <SkeletonBlock className="mt-3 h-4 w-36" />
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
        <SkeletonBlock className="h-6 w-48" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: rows }).map((_, index) => (
            <SkeletonBlock key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-emerald-950/20 bg-white/70 px-6 py-10 text-center shadow-sm shadow-emerald-950/5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
        {icon ?? <Inbox className="h-7 w-7" aria-hidden="true" />}
      </div>
      <h2 className="mt-4 text-xl font-semibold text-emerald-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-emerald-950/65">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-center text-rose-950 shadow-sm shadow-rose-950/5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-700 shadow-sm">
        <AlertCircle className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-rose-900/70">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          Riprova
        </button>
      ) : null}
    </div>
  );
}
