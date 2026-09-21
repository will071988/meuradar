import Link from "next/link";
import { Radar } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <Card>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2F8] text-[#0B2D5B]">
          <Radar className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-[#0B2D5B]">Página não encontrada</h1>
        <p className="mt-1 text-sm text-slate-500">
          Esse sinal se perdeu. Volte ao seu radar de hoje.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-xl bg-[#0B2D5B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#123e7a]"
        >
          Voltar ao início
        </Link>
      </Card>
    </div>
  );
}
