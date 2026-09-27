import type { PricePoint } from "@/types";

interface SparklineProps {
  history: PricePoint[];
  width?: number;
  height?: number;
}

/** Mini-gráfico SVG puro do histórico de preços (sem dependências). */
export function PriceSparkline({ history, width = 220, height = 56 }: SparklineProps) {
  if (history.length < 2) {
    return (
      <p className="text-xs text-slate-400">Histórico insuficiente para o gráfico.</p>
    );
  }

  const prices = history.map((h) => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;

  const pts = history.map((h, i) => {
    const x = (i / (history.length - 1)) * (width - 8) + 4;
    const y = height - 6 - ((h.price - min) / span) * (height - 14);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const last = pts[pts.length - 1]?.split(",") ?? ["0", "0"];
  const firstPrice = prices[0] ?? 0;
  const lastPrice = prices[prices.length - 1] ?? 0;
  const falling = lastPrice <= firstPrice;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Histórico de preços"
      className="h-14 w-full"
      preserveAspectRatio="none"
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={falling ? "#00C2D7" : "#FF8A3D"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="#FF8A3D" />
    </svg>
  );
}
