import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
}

export function Button({ variant = "primary", className, children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00C2D7]",
        variant === "primary" && "bg-[#0B2D5B] text-white hover:bg-[#123e7a]",
        variant === "outline" && "border border-slate-200 bg-white text-[#0B2D5B] hover:bg-slate-50",
        variant === "ghost" && "text-[#0B2D5B] hover:bg-slate-100",
        className
      )}
    >
      {children}
    </button>
  );
}
