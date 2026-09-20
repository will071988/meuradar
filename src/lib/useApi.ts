"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiResponse } from "@/types";

interface UseApiState<T> {
  data: T | null;
  source: ApiResponse<T>["source"] | null;
  updatedAt: string | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useApi<T>(url: string): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [source, setSource] = useState<ApiResponse<T>["source"] | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetch(url, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ApiResponse<T>>;
      })
      .then((json) => {
        if (!active) return;
        setData(json.data);
        setSource(json.source);
        setUpdatedAt(json.updatedAt);
      })
      .catch(() => {
        if (!active) return;
        setError("Não foi possível carregar agora. Tente atualizar.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [url, nonce]);

  return { data, source, updatedAt, loading, error, refresh };
}
