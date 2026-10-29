"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Calculator, Coins, Percent, Ruler } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SourceBadge } from "@/components/data/SourceBadge";
import { useApi } from "@/lib/useApi";
import { marketMock } from "@/data/mock";
import type { MarketItem } from "@/types";
import { cn } from "@/lib/utils";

const inputCls =
  "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#00C2D7] focus:outline-none";

/** "R$ 5,02" -> 5.02 */
function parseNumber(text: string): number | null {
  const cleaned = text.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function ToolHeader({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Coins;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#0B2D5B]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-base font-bold text-[#0B2D5B]">{title}</h2>
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
    </div>
  );
}

function CurrencyConverter() {
  const { data } = useApi<MarketItem[]>("/api/mercado");
  const [value, setValue] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "BTC">("USD");

  const rates = useMemo(() => {
    const list = data && data.length > 0 ? data : marketMock;
    const out: Record<string, number> = {};
    // chaves em maiúsculas para casar com o estado `currency` ("USD" | "EUR" | "BTC")
    for (const item of list) out[item.id.toUpperCase()] = parseNumber(item.value) ?? 0;
    return out;
  }, [data]);

  const amount = parseNumber(value);
  const result = amount !== null ? amount * (rates[currency] ?? 0) : null;

  return (
    <Card className="space-y-4">
      <ToolHeader icon={Coins} title="Conversor de moeda" hint="Cotação de referência em BRL" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="cv-value" className="text-sm font-bold text-[#0B2D5B]">
            Valor
          </label>
          <input
            id="cv-value"
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="100"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="cv-cur" className="text-sm font-bold text-[#0B2D5B]">
            Moeda
          </label>
          <select
            id="cv-cur"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as "USD" | "EUR" | "BTC")}
            className={inputCls}
          >
            <option value="USD">Dólar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="BTC">Bitcoin (BTC)</option>
          </select>
        </div>
      </div>
      <div className="rounded-xl bg-[#EAF2F8] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Resultado</p>
        <p className="mt-1 text-2xl font-extrabold text-[#0B2D5B]">
          {result !== null
            ? result.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            : "—"}
        </p>
        <p className="text-xs text-slate-500">
          1 {currency} ={" "}
          {(rates[currency] ?? 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: currency === "BTC" ? 0 : 3,
          })}
        </p>
      </div>
    </Card>
  );
}

function DiscountCalculator() {
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");

  const p = parseNumber(price);
  const d = parseNumber(discount);
  const final = p !== null && d !== null && d <= 100 ? p * (1 - d / 100) : null;
  const saving = p !== null && final !== null ? p - final : null;

  return (
    <Card className="space-y-4">
      <ToolHeader
        icon={Percent}
        title="Calculadora de desconto"
        hint="Quanto você paga e quanto economiza"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="dc-price" className="text-sm font-bold text-[#0B2D5B]">
            Preço original (R$)
          </label>
          <input
            id="dc-price"
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="2.249,00"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="dc-disc" className="text-sm font-bold text-[#0B2D5B]">
            Desconto (%)
          </label>
          <input
            id="dc-disc"
            type="text"
            inputMode="decimal"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="15"
            className={inputCls}
          />
        </div>
      </div>
      <div className="rounded-xl bg-[#EAF2F8] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Valor final</p>
        <p className="mt-1 text-2xl font-extrabold text-[#0B2D5B]">
          {final !== null
            ? final.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
            : "—"}
        </p>
        {saving !== null && saving > 0 && (
          <p className="text-xs font-semibold text-emerald-600">
            Economia de{" "}
            {saving.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        )}
      </div>
    </Card>
  );
}

function ImcCalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const w = parseNumber(weight);
  const h = parseNumber(height);
  const imc = w !== null && h !== null && h > 0.5 && h < 3 ? w / (h * h) : null;

  const classification = (() => {
    if (imc === null) return null;
    if (imc < 18.5) return { label: "Abaixo do peso", tone: "text-amber-600" };
    if (imc < 25) return { label: "Peso normal", tone: "text-emerald-600" };
    if (imc < 30) return { label: "Sobrepeso", tone: "text-amber-600" };
    return { label: "Obesidade", tone: "text-red-600" };
  })();

  return (
    <Card className="space-y-4">
      <ToolHeader icon={Ruler} title="Calculadora de IMC" hint="Índice de massa corporal" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="imc-w" className="text-sm font-bold text-[#0B2D5B]">
            Peso (kg)
          </label>
          <input
            id="imc-w"
            type="text"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="72"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="imc-h" className="text-sm font-bold text-[#0B2D5B]">
            Altura (m)
          </label>
          <input
            id="imc-h"
            type="text"
            inputMode="decimal"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="1,75"
            className={inputCls}
          />
        </div>
      </div>
      <div className="rounded-xl bg-[#EAF2F8] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Seu IMC</p>
        <p className="mt-1 text-2xl font-extrabold text-[#0B2D5B]">
          {imc !== null ? imc.toFixed(1) : "—"}
        </p>
        {classification && (
          <p className={cn("text-xs font-bold", classification.tone)}>
            {classification.label}
          </p>
        )}
      </div>
      <p className="text-[11px] text-slate-400">
        Referência OMS para adultos. Não substitui avaliação médica.
      </p>
    </Card>
  );
}

export default function FerramentasPage() {
  const { source } = useApi<MarketItem[]>("/api/mercado");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
            Ferramentas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Utilidades do dia a dia que funcionam aqui mesmo, sem sair do painel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {source && <SourceBadge source={source} />}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 ring-1 ring-inset ring-slate-200">
            <Calculator className="h-3 w-3" aria-hidden="true" /> 3 no total
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <CurrencyConverter />
        <DiscountCalculator />
        <ImcCalculator />
        <Card className="flex flex-col justify-center gap-2 border-dashed">
          <h2 className="text-base font-bold text-[#0B2D5B]">Mais em breve</h2>
          <p className="text-sm text-slate-500">
            Conversor de medidas, gerador de senhas, divisão de conta e leitura de QR Code chegam
            na próxima etapa.
          </p>
        </Card>
      </div>
    </div>
  );
}
