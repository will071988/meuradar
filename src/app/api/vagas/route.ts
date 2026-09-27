import { NextResponse } from "next/server";
import type { ApiResponse, RemoteJob } from "@/types";
import { jobsMock } from "@/data/mock";
import { fetchWithTimeout, getCache, setCache } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const preferredRegion = "gru1";

const TTL_MS = 30 * 60 * 1000;

interface AdzunaJob {
  id?: string;
  title?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  redirect_url?: string;
  created?: string;
  salary_min?: number;
  salary_max?: number;
  contract_time?: string;
}

interface AdzunaResponse {
  results?: AdzunaJob[];
}

function salaryText(min?: number, max?: number): string | undefined {
  if (typeof min !== "number" && typeof max !== "number") return undefined;
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  if (typeof min === "number" && typeof max === "number" && max > min) {
    return `${fmt(min)} – ${fmt(max)}`;
  }
  const v = (typeof max === "number" ? max : min) as number;
  return fmt(v);
}

/** Adzuna BR (agrega InfoJobs, Indeed e outros no Brasil). Precisa de chaves gratuitas. */
async function fromAdzuna(q: string, where: string): Promise<RemoteJob[]> {
  const appId = process.env.ADZUNA_APP_ID?.trim();
  const appKey = process.env.ADZUNA_APP_KEY?.trim();
  if (!appId || !appKey) return [];

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: "15",
    sort_by: "date",
  });
  if (q) params.set("what", q);
  params.set("where", where || "Rio de Janeiro");
  params.set("content-type", "application/json");

  const res = await fetchWithTimeout(
    `https://api.adzuna.com/v1/api/jobs/br/search/1?${params.toString()}`,
    9000
  );
  if (!res.ok) return [];
  const json = (await res.json()) as AdzunaResponse;
  return (json.results ?? [])
    .filter((j) => j.title && j.id)
    .map((j) => ({
      id: `az-${j.id}`,
      title: j.title as string,
      company: j.company?.display_name || "Empresa",
      location: j.location?.display_name || where || "Brasil",
      remote: /remot|home office/i.test(
        `${j.title} ${j.location?.display_name ?? ""} ${j.contract_time ?? ""}`
      ),
      url: j.redirect_url || "https://www.adzuna.com.br",
      postedAt: j.created ? ago(j.created, "Recente") : "Recente",
      salary: salaryText(j.salary_min, j.salary_max),
    }));
}
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

export async function GET(request: Request): Promise<NextResponse<ApiResponse<RemoteJob[]>>> {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const where = searchParams.get("where")?.trim() ?? "";
  const key = `vagas:${q.toLowerCase()}|${where.toLowerCase()}`;
  const cached = getCache<ApiResponse<RemoteJob[]>>(key);
  if (cached) return NextResponse.json(cached);

  try {
    // BR primeiro (Adzuna agrega InfoJobs/Indeed); depois globais; depois demo.
    const [az, a, r] = await Promise.all([
      fromAdzuna(q, where),
      q || where ? Promise.resolve([] as RemoteJob[]) : fromArbeitnow(),
      q || where ? Promise.resolve([] as RemoteJob[]) : fromRemotive(),
    ]);
    const seen = new Set<string>();
    const data = [...az, ...a, ...r].filter((j) => {
      const k = `${j.title}|${j.company}`.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    if (data.length === 0) throw new Error("empty");

    const payload: ApiResponse<RemoteJob[]> = {
      source: "live",
      updatedAt: new Date().toISOString(),
      data: data.slice(0, 20),
    };
    setCache(key, payload, TTL_MS);
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
