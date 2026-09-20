"use client";

import Link from "next/link";
import { Bell, Menu, Search } from "lucide-react";
import { LogoMark } from "./Logo";
import { useAuth } from "@/components/auth/AuthProvider";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, loading } = useAuth();
  const displayName = user ? user.name : "William";
  const initial = displayName.charAt(0).toUpperCase() || "W";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="rounded-xl p-2 text-[#0B2D5B] hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>

        <span className="flex items-center gap-2 lg:hidden">
          <LogoMark className="h-8 w-8" />
          <span className="text-base font-extrabold text-[#0B2D5B]">MeuRadar</span>
        </span>

        <div className="relative hidden flex-1 md:block">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Busque notícias, preços, produtos, vagas, cidades..."
            aria-label="Busca"
            className="w-full rounded-2xl border border-slate-200 bg-[#EAF2F8]/60 py-3 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#00C2D7] focus:outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            aria-label="Notificações"
            className="relative rounded-full border border-slate-200 p-2.5 text-[#0B2D5B] hover:bg-slate-50"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF8A3D]" />
          </button>
          {loading ? (
            <span className="h-10 w-28 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />
          ) : user ? (
            <Link href="/conta" className="flex items-center gap-2 rounded-xl hover:bg-slate-50">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B2D5B] text-sm font-bold text-white"
              >
                {initial}
              </span>
              <span className="hidden max-w-32 truncate text-sm font-semibold text-slate-700 sm:block">
                Olá, {displayName}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl bg-[#0B2D5B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#123e7a]"
              >
                Entrar
              </Link>
              <Link
                href="/conta"
                className="hidden items-center gap-2 sm:flex"
                aria-label="Conta demo"
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-[#0B2D5B]"
                >
                  W
                </span>
                <span className="hidden text-sm font-semibold text-slate-700 lg:block">
                  Olá, William
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Busque notícias, preços, produtos, vagas, cidades..."
            aria-label="Busca"
            className="w-full rounded-2xl border border-slate-200 bg-[#EAF2F8]/60 py-2.5 pl-11 pr-4 text-sm focus:border-[#00C2D7] focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
}
