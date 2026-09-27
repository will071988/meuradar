import { NextResponse } from "next/server";
import type { ApiResponse, RemoteJob } from "@/types";
import { jobsMock } from "@/data/mock";
import { fetchWithTimeout, getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const preferredRegion = "gru1";

const TTL_MS = 30 * 60 * 1000;
const KEY = "vagas:v1";

interface ArbeitnowJob {
  slug?: string;
  title?: string;
  company_name?: string;
  location?: string;
  remote?: boolean;
  url?: string;
  created_at?: number;
}

interface ArbeitnowResponse {
  data?: ArbeitnowJob[];
}

interface RemotiveJob {
  id?: number;
  title?: string;
  company_name?: string;
  candidate_required_location?: string;
  url?: string;
  publication_date?: string;
}

interface RemotiveResponse {
  jobs?: RemotiveJob[];
}

function ago(iso: string, fallback: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return fallback;
  const mins = Math.max(1, Math.round((Date.now() - t) / 60000));
  if (mins < 60) return `Há ${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `Há ${h}h`;
  return `Há ${Math.round(h / 24)}d`;
}

async function fromArbeitnow(): Promise<RemoteJob[]> {
  const res = await fetchWithTimeout("https://www.arbeitnow.com/api/job-board-api", 9000);
  if (!res.ok) return [];
  const json = (await res.json()) as ArbeitnowResponse;
  return (json.data ?? [])
    .filter((j) => j.title && j.slug)
    .slice(0, 12)
    .map((j) => ({
      id: `an-${j.slug}`,
      title: j.title as string,
      company: j.company_name || "Empresa",
      location: j.remote ? "Remoto" : j.location || "—",
      remote: j.remote !== false,
      url: j.url || "https://www.arbeitnow.com",
      postedAt: j.created_at
        ? ago(new Date(j.created_at * 1000).toISOString(), "Recente")
        : "Recente",
    }));
}

async function fromRemotive(): Promise<RemoteJob[]> {
  const res = await fetchWithTimeout("https://remotive.com/api/remote-jobs?limit=12", 9000);
  if (!res.ok) return [];
  const json = (await res.json()) as RemotiveResponse;
  return (json.jobs ?? [])
    .filter((j) => j.title && j.id)
    .slice(0, 12)
    .map((j) => ({
      id: `re-${j.id}`,
      title: j.title as string,
      company: j.company_name || "Empresa",
      location: j.candidate_required_location || "Remoto",
      remote: true,
      url: j.url || "https://remotive.com",
      postedAt: j.publication_date ? ago(j.publication_date, "Recente") : "Recente",
    }));
}

export async function GET(): Promise<NextResponse<ApiResponse<RemoteJob[]>>> {
  const cached = getCache<ApiResponse<RemoteJob[]>>(KEY);
  if (cached) return NextResponse.json(cached);

  try {
    const [a, r] = await Promise.all([fromArbeitnow(), fromRemotive()]);
    const seen = new Set<string>();
    const data = [...a, ...r].filter((j) => {
      const key = `${j.title}|${j.company}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (data.length === 0) throw new Error("empty");

    const payload: ApiResponse<RemoteJob[]> = {
      source: "live",
      updatedAt: new Date().toISOString(),
      data: data.slice(0, 16),
    };
    setCache(KEY, payload, TTL_MS);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({
      source: "demo",
      updatedAt: new Date().toISOString(),
      data: jobsMock.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.detail,
        location: j.extra ?? "",
        remote: /remoto/i.test(j.detail),
        url: "/vagas",
        postedAt: "Demo",
      })),
    });
  }
}
