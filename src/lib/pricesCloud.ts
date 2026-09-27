import type { PriceTrack } from "@/types";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase";

interface TrackRow {
  id: string;
  user_id: string;
  product: string;
  store: string;
  target_price: number;
  current_price: number;
  history: { at: string; price: number }[];
  active: boolean;
  created_at: string;
}

export function canSyncPrices(): boolean {
  return isSupabaseConfigured() && typeof window !== "undefined";
}

function toTrack(row: TrackRow): PriceTrack {
  return {
    id: `cloud-${row.id}`,
    cloudId: row.id,
    product: row.product,
    store: row.store ?? "Loja demo",
    targetPrice: Number(row.target_price),
    currentPrice: Number(row.current_price),
    history: Array.isArray(row.history) ? row.history : [],
    active: row.active !== false,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export async function fetchCloudTracks(userId: string): Promise<PriceTrack[] | null> {
  if (!canSyncPrices()) return null;
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("price_tracks")
      .select("id,user_id,product,store,target_price,current_price,history,active,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) return null;
    return ((data ?? []) as TrackRow[]).map(toTrack);
  } catch {
    return null;
  }
}

export async function insertCloudTrack(userId: string, track: PriceTrack): Promise<string | null> {
  if (!canSyncPrices()) return null;
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("price_tracks")
      .insert({
        user_id: userId,
        product: track.product,
        store: track.store,
        target_price: track.targetPrice,
        current_price: track.currentPrice,
        history: track.history,
        active: track.active,
      })
      .select("id")
      .single();
    if (error) return null;
    return (data as { id: string } | null)?.id ?? null;
  } catch {
    return null;
  }
}

export async function updateCloudTrack(
  cloudId: string,
  patch: Partial<{
    product: string;
    store: string;
    target_price: number;
    current_price: number;
    history: { at: string; price: number }[];
    active: boolean;
  }>
): Promise<boolean> {
  if (!canSyncPrices()) return false;
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;
    const { error } = await supabase.from("price_tracks").update(patch).eq("id", cloudId);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteCloudTrack(cloudId: string): Promise<boolean> {
  if (!canSyncPrices()) return false;
  try {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;
    const { error } = await supabase.from("price_tracks").delete().eq("id", cloudId);
    return !error;
  } catch {
    return false;
  }
}
