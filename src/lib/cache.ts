interface CacheEntry<T> {
  expires: number;
  payload: T;
}

const store = new Map<string, CacheEntry<unknown>>();

export function getCache<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }
  return entry.payload;
}

export function setCache<T>(key: string, payload: T, ttlMs: number): void {
  store.set(key, { expires: Date.now() + ttlMs, payload });
}

export async function fetchWithTimeout(
  url: string,
  timeoutMs = 8000,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal, next: { revalidate: 0 } });
  } finally {
    clearTimeout(timer);
  }
}
