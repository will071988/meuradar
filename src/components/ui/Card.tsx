import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_16px_rgba(11,45,91,0.06)]",
        className
      )}
    >
      {children}
    </section>
  );
}
