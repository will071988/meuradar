import { CalendarCard } from "@/components/dashboard/CalendarCard";
import { Greeting } from "@/components/dashboard/Greeting";
import { JobsCard } from "@/components/dashboard/JobsCard";
import { MarketCard } from "@/components/dashboard/MarketCard";
import { NewsCard } from "@/components/dashboard/NewsCard";
import { PackageCard } from "@/components/dashboard/PackageCard";
import { PriceAlertCard } from "@/components/dashboard/PriceAlertCard";
import { RadarToday } from "@/components/dashboard/RadarToday";
import { SportsCard } from "@/components/dashboard/SportsCard";
import { WeatherCard } from "@/components/dashboard/WeatherCard";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <Greeting />

      <RadarToday />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeatherCard />
        </div>
        <MarketCard />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <PackageCard />
        <PriceAlertCard />
        <JobsCard />
        <NewsCard />
        <SportsCard />
        <CalendarCard />
      </div>
    </div>
  );
}
