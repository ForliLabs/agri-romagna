import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full rounded-xl border bg-white text-emerald-950 transition placeholder:text-emerald-950/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      inputSize: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-3 py-2 text-sm",
        lg: "px-4 py-3 text-sm",
      },
      state: {
        default: "border-emerald-950/20",
        error: "border-rose-400 focus:ring-rose-500",
      },
    },
    defaultVariants: {
      inputSize: "md",
      state: "default",
    },
  },
);

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> &
  VariantProps<typeof inputVariants>;

function Input({ className, inputSize, state, ...props }: InputProps) {
  return (
    <input
      className={cn(inputVariants({ inputSize, state }), className)}
      {...props}
    />
  );
}

export { Input, inputVariants };
export type { InputProps };
