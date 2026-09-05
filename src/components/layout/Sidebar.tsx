"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CloudSun,
  Crown,
  Home,
  LineChart,
  Newspaper,
  Radar,
  Settings,
  Tags,
  Trophy,
  Wrench,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const navItems = [
  { href: "/", label: "Início", icon: Home },
  { href: "/meu-radar", label: "Meu Radar", icon: Radar },
  { href: "/clima", label: "Clima", icon: CloudSun },
  { href: "/noticias", label: "Notícias", icon: Newspaper },
  { href: "/mercado", label: "Mercado", icon: LineChart },
  { href: "/precos", label: "Preços", icon: Tags },
  { href: "/vagas", label: "Vagas", icon: Briefcase },
  { href: "/esportes", label: "Esportes", icon: Trophy },
  { href: "/ferramentas", label: "Ferramentas", icon: Wrench },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-slate-100 bg-white lg:flex">
      <div className="px-6 pb-4 pt-6">
        <Logo />
      </div>

      <nav aria-label="Navegação principal" className="flex-1 space-y-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-[#0B2D5B] text-white shadow-[0_8px_30px_rgba(11,45,91,0.18)]"
                  : "text-slate-600 hover:bg-[#EAF2F8] hover:text-[#0B2D5B]"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#0B2D5B] to-[#1450A0] p-4 text-white">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-[#FF8A3D]" aria-hidden="true" />
            <p className="text-sm font-bold">MeuRadar Pro</p>
          </div>
          <p className="mt-1 text-xs text-white/80">Mais recursos para o seu dia.</p>
          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-[#FF8A3D] px-3 py-2 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Conheça agora
          </button>
        </div>
      </div>
    </aside>
  );
}
