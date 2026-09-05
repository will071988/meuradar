import type { LucideIcon } from "lucide-react";
import { Radar } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface ModulePageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function ModulePage({ title, description, icon: Icon = Radar }: ModulePageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">{description}</p>
      </div>
      <Card className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2F8] text-[#0B2D5B]">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="text-base font-bold text-[#0B2D5B]">Módulo em preparação</p>
        <p className="max-w-md text-sm text-slate-500">
          Estamos preparando o módulo de {title.toLowerCase()} com dados em tempo real,
          personalização e alertas inteligentes. Em breve aqui no MeuRadar.
        </p>
      </Card>
    </div>
  );
}
