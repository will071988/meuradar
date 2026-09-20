"use client";

import Link from "next/link";
import { Bell, Database, MapPin, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const supabaseOn = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B] sm:text-3xl">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Conta, preferências, localização e personalização do radar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#0B2D5B]">
            <User className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-base font-bold text-[#0B2D5B]">Conta e perfil</p>
          <p className="text-sm text-slate-500">
            {user ? `Conectado como ${user.email}` : "Entre ou crie sua conta gratuita."}
          </p>
          <Link
            href="/conta"
            className="mt-3 inline-block rounded-xl bg-[#0B2D5B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#123e7a]"
          >
            Abrir conta
          </Link>
        </Card>

        <Card>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#0B2D5B]">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-base font-bold text-[#0B2D5B]">Localização e interesses</p>
          <p className="text-sm text-slate-500">
            Cidade, time e temas que priorizam seu feed.
          </p>
          <Link
            href="/conta"
            className="mt-3 inline-block rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#0B2D5B] hover:bg-slate-50"
          >
            Editar preferências
          </Link>
        </Card>

        <Card>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#0B2D5B]">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-base font-bold text-[#0B2D5B]">Notificações</p>
          <p className="text-sm text-slate-500">
            E-mail e push configuráveis na página da conta. WhatsApp em breve.
          </p>
        </Card>

        <Card>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF2F8] text-[#0B2D5B]">
            <Database className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-base font-bold text-[#0B2D5B]">Backend</p>
          <p className="text-sm text-slate-500">
            Supabase: {supabaseOn ? "configurado" : "modo demo local"}. Veja{" "}
            <code className="rounded bg-slate-100 px-1">supabase/schema.sql</code> para as tabelas.
          </p>
        </Card>
      </div>
    </div>
  );
}
