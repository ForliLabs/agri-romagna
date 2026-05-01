import { cn } from "@/lib/utils";

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function QrBadge({
  value,
  className,
  size = 11,
}: {
  value: string;
  className?: string;
  size?: number;
}) {
  const seed = hashString(value);
  const cells = Array.from({ length: size * size }, (_, index) => {
    const row = Math.floor(index / size);
    const column = index % size;
    const isCornerMarker =
      (row < 3 && column < 3) ||
      (row < 3 && column >= size - 3) ||
      (row >= size - 3 && column < 3);

    if (isCornerMarker) return true;
    return ((seed + row * 17 + column * 31) % 5) < 2;
  });

  return (
    <div
      className={cn("grid aspect-square rounded-2xl border border-emerald-950/10 bg-white p-2 shadow-sm", className)}
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      role="img"
      aria-label={`Codice QR per ${value}`}
    >
      {cells.map((filled, index) => (
        <span
          key={index}
          className={cn("rounded-[2px]", filled ? "bg-emerald-950" : "bg-transparent")}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
