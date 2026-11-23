"use client";

import { Briefcase } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { useApi } from "@/lib/useApi";
import type { RemoteJob } from "@/types";

export function JobsCard() {
  const { data } = useApi<RemoteJob[]>("/api/vagas");
  const jobs = (data ?? []).slice(0, 3);

  return (
    <Card>
      <SectionHeader title="Vagas e Concursos" />
      {jobs.length === 0 ? (
        <p className="text-sm text-slate-500">Carregando vagas...</p>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#0B2D5B]">
                <Briefcase className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold leading-snug text-[#0B2D5B]">{job.title}</p>
                  {job.remote && <Badge tone="new">Remota</Badge>}
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {job.company} • {job.location}
                  {job.salary ? ` • ${job.salary}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
