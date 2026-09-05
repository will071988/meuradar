import { CloudSun, MapPin, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { weatherMock } from "@/data/mock";

export function WeatherCard() {
  const w = weatherMock;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[#0B2D5B] via-[#1450A0] to-[#00C2D7] !border-0 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm text-white/80">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {w.city}
          </p>
          <p className="mt-2 text-5xl font-extrabold tracking-tight">{w.temperature}°C</p>
          <p className="mt-1 text-sm font-semibold text-white/90">
            {w.condition} • Sensação {w.feelsLike}°C
          </p>
        </div>
        <span className="rounded-2xl bg-white/15 p-3">
          <CloudSun className="h-10 w-10" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2 text-center">
        {w.forecast.map((d) => (
          <div key={d.label} className="rounded-xl bg-white/10 px-2 py-2.5">
            <p className="text-xs font-semibold text-white/70">{d.label}</p>
            <p className="mt-1 text-sm font-bold">
              {d.max}° <span className="font-medium text-white/60">{d.min}°</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#FF8A3D]/15 p-3 ring-1 ring-inset ring-white/20">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#FF8A3D]" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-bold">{w.alertTitle}</p>
          <p className="text-xs text-white/80">{w.alertDescription}</p>
          <span className="mt-1 inline-block cursor-pointer text-xs font-bold text-white underline underline-offset-2">
            Ver detalhes
          </span>
        </div>
      </div>
    </Card>
  );
}
