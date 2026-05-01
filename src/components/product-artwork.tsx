import { Apple, Package, ShoppingBasket, Wheat, Wine, type LucideIcon } from "lucide-react";
import type { ProductCategory } from "@/lib/marketplace-data";

const categoryVisuals: Record<
  ProductCategory,
  { icon: LucideIcon; gradient: string; label: string }
> = {
  vino: { icon: Wine, gradient: "from-violet-100 via-fuchsia-50 to-rose-100", label: "Cantina" },
  frutta: { icon: Apple, gradient: "from-amber-100 via-orange-50 to-rose-100", label: "Frutta fresca" },
  cereali: { icon: Wheat, gradient: "from-yellow-100 via-amber-50 to-lime-100", label: "Cereali" },
  olio: { icon: ShoppingBasket, gradient: "from-lime-100 via-emerald-50 to-green-100", label: "Olio" },
  ortaggi: { icon: ShoppingBasket, gradient: "from-emerald-100 via-lime-50 to-sky-100", label: "Ortaggi" },
  trasformati: { icon: Package, gradient: "from-sky-100 via-indigo-50 to-violet-100", label: "Trasformati" },
};

export function ProductArtwork({
  category,
  title,
  subtitle,
}: {
  category: ProductCategory;
  title: string;
  subtitle: string;
}) {
  const visual = categoryVisuals[category];
  const Icon = visual.icon;

  return (
    <div className={`flex h-28 items-center justify-between rounded-2xl bg-gradient-to-br ${visual.gradient} px-4`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-950/50">{visual.label}</p>
        <p className="mt-2 max-w-[10rem] text-sm font-semibold text-emerald-950">{title}</p>
        <p className="mt-1 text-xs text-emerald-950/55">{subtitle}</p>
      </div>
      <div className="rounded-2xl bg-white/80 p-3 shadow-sm shadow-emerald-950/5">
        <Icon className="h-7 w-7 text-emerald-800" aria-hidden="true" />
      </div>
    </div>
  );
}
