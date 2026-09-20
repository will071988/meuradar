"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { PreferencesForm } from "@/components/preferences/PreferencesForm";

export default function ContaPage() {
  const { user, loading, isMock, signOut, updateName } = useAuth();
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
            Sua conta
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Entre para salvar preferências e personalizar seu radar.
          </p>
        </div>
        <Card className="text-center">
          <p className="text-base font-bold text-[#0B2D5B]">Você ainda não entrou</p>
          <p className="mt-1 text-sm text-slate-500">
            Crie sua conta gratuita ou acesse para continuar.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link
              href="/login"
              className="rounded-xl bg-[#0B2D5B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#123e7a]"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#0B2D5B] hover:bg-slate-50"
            >
              Criar conta
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const initial = user.name.charAt(0).toUpperCase() || "U";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
          Olá, {user.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Gerencie seu perfil e personalize seu radar.
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0B2D5B] text-xl font-extrabold text-white"
          >
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-[#0B2D5B]">{user.name}</p>
            <p className="truncate text-sm text-slate-500">{user.email}</p>
            {isMock && (
              <p className="mt-1 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
                Conta demo local
              </p>
            )}
          </div>
          <Button type="button" variant="outline" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sair
          </Button>
        </div>

        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            void updateName(name).then(() => {
              setSavedName(true);
              setName("");
            });
          }}
        >
          <label htmlFor="profile-name" className="sr-only">
            Novo nome
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSavedName(false);
            }}
            placeholder="Atualizar nome"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#00C2D7] focus:outline-none"
          />
          <Button type="submit" variant="outline">
            Salvar nome
          </Button>
          {savedName && (
            <span role="status" className="self-center text-sm font-bold text-emerald-600">
              Atualizado!
            </span>
          )}
        </form>
      </Card>

      <PreferencesForm />
    </div>
  );
}
