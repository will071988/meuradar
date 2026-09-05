import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "new" | "hot" | "neutral" | "down" | "up";

const tones: Record<Tone, string> = {
  new: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  hot: "bg-orange-50 text-orange-600 ring-orange-200",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200",
  down: "bg-red-50 text-red-600 ring-red-200",
  up: "bg-emerald-50 text-emerald-600 ring-emerald-200",
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
