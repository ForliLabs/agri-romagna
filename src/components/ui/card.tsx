import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-3xl border bg-white/90 shadow-sm", {
  variants: {
    variant: {
      default: "border-emerald-950/10 shadow-emerald-950/5",
      elevated: "border-emerald-950/10 shadow-md shadow-emerald-950/10",
      outline: "border-emerald-950/20 shadow-none",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants>;

function Card({ className, variant, padding, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1.5", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold text-emerald-950", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-emerald-950/65", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, cardVariants };
export type { CardProps };
