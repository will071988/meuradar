import { Bell, CloudRain, Package, Tag, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { radarTodayMock } from "@/data/mock";

const icons = {
  "cloud-rain": CloudRain,
  tag: Tag,
  trophy: Trophy,
  package: Package,
  bell: Bell,
} as const;

export function RadarToday() {
  return (
    <Card className="bg-white">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[#0B2D5B] sm:text-lg">Seu Radar de Hoje</h2>
        <p className="text-sm text-slate-500">
          O que você realmente precisa saber hoje, em um só lugar.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {radarTodayMock.map((item) => {
          const Icon = icons[item.icon];
          return (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-[#EAF2F8]/60 p-3.5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0B2D5B] shadow-sm">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-[13px] font-semibold leading-snug text-[#0B2D5B]">
                {item.text}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
