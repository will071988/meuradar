"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AppUser } from "@/types";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isMock: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "meuradar-user-v1";

function userFromEmail(id: string, email: string, name?: string): AppUser {
  const fallback = email.split("@")[0] || "Usuário";
  return { id, email, name: name && name.trim() ? name.trim() : fallback };
}

function readMockUser(): AppUser | null {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppUser;
    if (!parsed.id || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isMock = !isSupabaseConfigured();

  useEffect(() => {
    let active = true;

    async function init() {
      if (isMock) {
        if (active) {
          setUser(readMockUser());
          setLoading(false);
        }
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (active) {
          setUser(readMockUser());
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      if (active) {
        if (sessionUser) {
          const name =
            (sessionUser.user_metadata?.name as string | undefined) ||
            sessionUser.email?.split("@")[0] ||
            "Usuário";
          setUser({ id: sessionUser.id, email: sessionUser.email ?? "", name });
        } else {
          setUser(null);
        }
        setLoading(false);
      }

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user ?? null;
        if (!u) {
          setUser(null);
          return;
        }
        const name =
          (u.user_metadata?.name as string | undefined) ||
          u.email?.split("@")[0] ||
          "Usuário";
        setUser({ id: u.id, email: u.email ?? "", name });
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    }

    void init();
    return () => {
      active = false;
    };
  }, [isMock]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || password.length < 6) {
        return { error: "Informe e-mail válido e senha com ao menos 6 caracteres." };
      }

      if (isMock) {
        const mockUser = userFromEmail(`mock-${Date.now()}`, cleanEmail, readMockUser()?.name);
        window.localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
        setUser(mockUser);
        return { error: null };
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) return { error: "Supabase não configurado." };
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      return { error: error ? error.message : null };
    },
    [isMock]
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<{ error: string | null }> => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();
      if (!cleanName || !cleanEmail || password.length < 6) {
        return { error: "Preencha nome, e-mail válido e senha com ao menos 6 caracteres." };
      }

      if (isMock) {
        const mockUser = userFromEmail(`mock-${Date.now()}`, cleanEmail, cleanName);
        window.localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
        setUser(mockUser);
        return { error: null };
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) return { error: "Supabase não configurado." };
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { name: cleanName } },
      });
      return { error: error ? error.message : null };
    },
    [isMock]
  );

  const signOut = useCallback(async (): Promise<void> => {
    if (isMock) {
      window.localStorage.removeItem(USER_KEY);
      setUser(null);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }, [isMock]);

  const updateName = useCallback(
    async (name: string): Promise<void> => {
      const clean = name.trim();
      if (!clean || !user) return;
      const updated: AppUser = { ...user, name: clean };
      setUser(updated);

      if (isMock) {
        window.localStorage.setItem(USER_KEY, JSON.stringify(updated));
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      await supabase.auth.updateUser({ data: { name: clean } });
      await supabase.from("profiles").upsert({ id: user.id, name: clean, email: user.email });
    },
    [user, isMock]
  );

  const value = useMemo(
    () => ({ user, loading, isMock, signIn, signUp, signOut, updateName }),
    [user, loading, isMock, signIn, signUp, signOut, updateName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
