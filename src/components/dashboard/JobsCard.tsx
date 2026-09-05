import { Briefcase } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { jobsMock } from "@/data/mock";

export function JobsCard() {
  return (
    <Card>
      <SectionHeader title="Vagas e Concursos" />
      <ul className="space-y-3">
        {jobsMock.map((job) => (
          <li key={job.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#0B2D5B]">
              <Briefcase className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold leading-snug text-[#0B2D5B]">{job.title}</p>
                <Badge tone={job.badgeTone}>{job.badge}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {job.detail}
                {job.extra ? ` • ${job.extra}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
