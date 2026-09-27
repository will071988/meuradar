"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

function periodForHour(h: number): string {
  if (h >= 5 && h < 12) return "BOM DIA,";
  if (h >= 12 && h < 18) return "BOA TARDE,";
  return "BOA NOITE,";
}

export function Greeting() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("BOM DIA,");

  useEffect(() => {
    setPeriod(periodForHour(new Date().getHours()));
  }, []);

  const name = user?.name?.split(" ")[0] || "William";

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
        {period}
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-4xl">
        {name} ☀️
      </h1>
      <p className="mt-1 text-sm text-slate-500 sm:text-base">
        Aqui está o que importa para hoje.
      </p>
    </div>
  );
}
