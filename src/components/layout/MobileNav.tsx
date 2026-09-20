"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, Radar, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const mobileLinks = [
  { href: "/", label: "Início", icon: Home },
  { href: "/meu-radar", label: "Meu Radar", icon: Radar },
  { href: "/clima", label: "Clima", icon: Search },
  { href: "/vagas", label: "Vagas", icon: Heart },
  { href: "/conta", label: "Conta", icon: LayoutGrid },
];

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            aria-label="Fechar menu"
            onClick={onClose}
            className="absolute inset-0 h-full w-full bg-[#0B2D5B]/40"
          />
          <div className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between px-5 pb-2 pt-5">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar menu"
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Menu móvel" className="flex-1 space-y-1 overflow-y-auto p-3">
              {mobileLinks.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold",
                      active ? "bg-[#0B2D5B] text-white" : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 text-xs text-slate-500">
              A informação que importa para você, em só um lugar.
            </div>
          </div>
        </div>
      )}

      <nav
        aria-label="Navegação inferior"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-100 bg-white/95 backdrop-blur lg:hidden"
      >
        <div className="grid grid-cols-5">
          {[
            { href: "/", label: "Início", icon: Home },
            { href: "/meu-radar", label: "Meu Radar", icon: Radar },
            { href: "/noticias", label: "Buscar", icon: Search },
            { href: "/precos", label: "Favoritos", icon: Heart },
            { href: "/conta", label: "Conta", icon: LayoutGrid },
          ].map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                  active ? "text-[#0B2D5B]" : "text-slate-400"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
