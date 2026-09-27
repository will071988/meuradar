"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatBRLTrack, parseBRL } from "@/lib/prices";

interface PriceTrackFormProps {
  onCreate: (input: {
    product: string;
    store: string;
    targetPrice: number;
    currentPrice: number;
  }) => void;
}

export function PriceTrackForm({ onCreate }: PriceTrackFormProps) {
  const [product, setProduct] = useState("");
  const [store, setStore] = useState("");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product.trim()) {
      setError("Informe o produto. Ex.: Monitor LG UltraGear 27\"");
      return;
    }
    const targetPrice = parseBRL(target);
    const currentPrice = parseBRL(current);
    if (targetPrice === null || currentPrice === null) {
      setError(`Preços inválidos. Ex.: ${formatBRLTrack(1899)}`);
      return;
    }
    setError(null);
    onCreate({ product, store, targetPrice, currentPrice });
    setProduct("");
    setStore("");
    setTarget("");
    setCurrent("");
  }

  const inputCls =
    "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#00C2D7] focus:outline-none";

  return (
    <Card>
      <h2 className="text-base font-bold text-[#0B2D5B]">Monitorar novo produto</h2>
      <p className="text-sm text-slate-500">
        Registre o preço atual e o alvo. Avisamos quando atingir.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="pt-product" className="text-sm font-bold text-[#0B2D5B]">
              Produto
            </label>
            <input
              id="pt-product"
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder='Monitor LG UltraGear 27"'
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="pt-store" className="text-sm font-bold text-[#0B2D5B]">
              Loja (opcional)
            </label>
            <input
              id="pt-store"
              type="text"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="Kabum, Amazon..."
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="pt-target" className="text-sm font-bold text-[#0B2D5B]">
              Preço-alvo
            </label>
            <input
              id="pt-target"
              type="text"
              inputMode="decimal"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="R$ 1.899,00"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="pt-current" className="text-sm font-bold text-[#0B2D5B]">
              Preço atual
            </label>
            <input
              id="pt-current"
              type="text"
              inputMode="decimal"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="R$ 2.249,00"
              className={inputCls}
            />
          </div>
        </div>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full sm:w-auto">
          Começar a monitorar
        </Button>
      </form>
    </Card>
  );
}
