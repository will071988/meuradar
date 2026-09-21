import type { Metadata } from "next";
import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "MeuRadar Pro — Mais recursos para o seu dia",
  description:
    "Sem anúncios, mais radares, monitoramento frequente e alertas em tempo real com o MeuRadar Pro.",
};

const freeFeatures = ["Até 3 radares ativos", "Atualização a cada visita", "1 cidade monitorada", "Alertas no app"];
const proFeatures = [
  "Radares ilimitados",
  "Monitoramento a cada 5 minutos",
  "Múltiplas cidades e times",
  "Alertas em tempo real (push, e-mail, WhatsApp)",
  "Histórico avançado de preços e alertas",
  "Sem anúncios",
];

export default function ProPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0B2D5B] to-[#1450A0] text-[#FF8A3D]">
          <Crown className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
          MeuRadar Pro
        </h1>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 sm:text-base">
          Mais recursos para o seu dia. Planos em breve — deixe seu radar pronto desde já.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-base font-bold text-[#0B2D5B]">Gratuito</p>
          <p className="mt-1 text-3xl font-extrabold text-[#0B2D5B]">
            R$ 0<span className="text-sm font-semibold text-slate-400">/sempre</span>
          </p>
          <ul className="mt-4 space-y-2">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C2D7]" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/meu-radar"
            className="mt-5 block rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-bold text-[#0B2D5B] hover:bg-slate-50"
          >
            Usar grátis
          </Link>
        </Card>

        <Card className="border-2 !border-[#FF8A3D]">
          <p className="inline-block rounded-full bg-[#FF8A3D] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
            Em breve
          </p>
          <p className="mt-2 text-base font-bold text-[#0B2D5B]">Pro</p>
          <p className="mt-1 text-3xl font-extrabold text-[#0B2D5B]">
            R$ 14,90<span className="text-sm font-semibold text-slate-400">/mês</span>
          </p>
          <ul className="mt-4 space-y-2">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/conta"
            className="mt-5 block rounded-xl bg-[#FF8A3D] px-4 py-2.5 text-center text-sm font-bold text-white hover:brightness-110"
          >
            Criar conta e aguardar
          </Link>
        </Card>
      </div>

      <p className="text-center text-xs text-slate-400">
        Preço e recursos provisórios para validação. Sem cobrança nesta versão.
      </p>
    </div>
  );
}
