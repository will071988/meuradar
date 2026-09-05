import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="MeuRadar logo"
      className={cn("h-9 w-9", className)}
    >
      <circle cx="24" cy="24" r="21" fill="#0B2D5B" />
      <circle cx="24" cy="24" r="15" fill="none" stroke="#00C2D7" strokeWidth="2" opacity="0.9" />
      <circle cx="24" cy="24" r="9" fill="none" stroke="#00C2D7" strokeWidth="2" opacity="0.6" />
      <path d="M24 24 L38 14 A17 17 0 0 0 34 10 Z" fill="#FF8A3D" />
      <circle cx="24" cy="24" r="3.5" fill="#fff" />
      <circle cx="24" cy="24" r="1.6" fill="#FF8A3D" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark />
      {!compact && (
        <span className="leading-tight">
          <span className="block text-lg font-extrabold tracking-tight text-[#0B2D5B]">
            MeuRadar
          </span>
          <span className="block text-[11px] font-medium text-slate-500">
            A informação que importa para você, em só um lugar.
          </span>
        </span>
      )}
    </span>
  );
}
