"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** Current value (0–100) */
  value: number;
  /** Accessible label describing what the bar represents */
  label?: string;
  /** Color class for the filled portion. Defaults to emerald. */
  colorClass?: string;
  /** Additional className on the outer container */
  className?: string;
  /** Height class. Defaults to "h-2" */
  height?: string;
  /** Whether to show the percentage text next to the bar */
  showValue?: boolean;
}

/**
 * Accessible progress bar with ARIA attributes, configurable color and height.
 */
export function ProgressBar({
  value,
  label,
  colorClass,
  className,
  height = "h-2",
  showValue = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  const resolvedColor =
    colorClass ??
    (clamped > 70
      ? "bg-emerald-500"
      : clamped > 40
        ? "bg-amber-500"
        : "bg-rose-500");

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn("w-full overflow-hidden rounded-full bg-emerald-950/10", height)}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-300", resolvedColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showValue && (
        <span className="shrink-0 text-sm font-bold tabular-nums text-emerald-950/75">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
