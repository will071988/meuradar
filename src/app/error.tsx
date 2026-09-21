"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <Card>
        <h1 className="text-2xl font-extrabold text-[#0B2D5B]">Algo saiu do radar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tivemos um problema ao carregar esta página. Tente novamente.
        </p>
        <Button type="button" onClick={reset} className="mt-4">
          Tentar de novo
        </Button>
      </Card>
    </div>
  );
}
