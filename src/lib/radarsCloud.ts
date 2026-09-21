import type { Radar } from "@/types";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase";

interface RadarRow {
  id: string;
  user_id: string;
  title: string;
  type: string;
  target: string;
  city: string;
  active: boolean;
  created_at: string;
}

export function canSyncCloud(): boolean {
  return isSupabaseConfigured() && typeof window !== "undefined";
}

function toRadar(row: RadarRow): Radar {
  return {
    id: `cloud-${row.id}`,
    cloudId: row.id,
    title: row.title,
    type: (row.type as Radar["type"]) || "custom",
    target: row.target ?? "",
    city: row.city ?? "",
    active: row.active !== false,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

/** Busca radares do usuário na nuvem. Retorna null se indisponível/erro. */
export async function fetchCloudRadars(userId: string): Promise<Radar[] | null> {
  if (!canSyncCloud()) return null;
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("radars")
      .select("id,user_id,title,type,target,city,active,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) return null;
    return ((data ?? []) as RadarRow[]).map(toRadar);
  } catch {
    return null;
  }
}

/** Insere um radar na nuvem. Retorna o id da linha ou null. */
export async function insertCloudRadar(userId: string, radar: Radar): Promise<string | null> {
  if (!canSyncCloud()) return null;
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("radars")
      .insert({
        user_id: userId,
        title: radar.title,
        type: radar.type,
        target: radar.target,
        city: radar.city,
        active: radar.active,
      })
      .select("id")
      .single();
    if (error) return null;
    const row = data as { id: string } | null;
    return row?.id ?? null;
  } catch {
    return null;
  }
}

export async function updateCloudRadar(
  cloudId: string,
  patch: Partial<Pick<Radar, "title" | "type" | "target" | "city" | "active">>
): Promise<boolean> {
  if (!canSyncCloud()) return false;
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;
    const { error } = await supabase.from("radars").update(patch).eq("id", cloudId);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteCloudRadar(cloudId: string): Promise<boolean> {
  if (!canSyncCloud()) return false;
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;
    const { error } = await supabase.from("radars").delete().eq("id", cloudId);
    return !error;
  } catch {
    return false;
  }
}
