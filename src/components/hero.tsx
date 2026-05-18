import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface HeroProps {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  children?: ReactNode;
  className?: string;
}

export function Hero({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  children,
  className,
}: HeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-emerald-950 via-green-900 to-lime-700 py-20 text-white sm:py-28 lg:py-32",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(244,206,138,0.16),transparent_24%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-emerald-50/85 sm:text-xl">
            {subtitle}
          </p>
          {(ctaLabel || secondaryLabel) && (
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {ctaLabel && ctaHref && (
                <a
                  href={ctaHref}
                  className="rounded-full bg-[#f4f1e8] px-8 py-3.5 text-base font-semibold text-emerald-950 shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  {ctaLabel}
                </a>
              )}
              {secondaryLabel && secondaryHref && (
                <a
                  href={secondaryHref}
                  className="rounded-full border border-white/25 px-8 py-3.5 text-base font-semibold text-white/90 backdrop-blur transition-colors hover:bg-white/10"
                >
                  {secondaryLabel}
                </a>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
