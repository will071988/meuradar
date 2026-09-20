"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "./AuthProvider";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { signIn, signUp, isMock } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const result =
      mode === "login" ? await signIn(email, password) : await signUp(name, email, password);

    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/conta");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <h1 className="text-2xl font-extrabold tracking-tight text-[#0B2D5B]">
        {mode === "login" ? "Entrar no MeuRadar" : "Criar sua conta"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {mode === "login"
          ? "Acesse seu radar personalizado."
          : "Salve preferências e monte seu radar."}
      </p>

      {isMock && (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
          Modo demonstração: Supabase não configurado. O login é salvo apenas neste navegador.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        {mode === "signup" && (
          <div>
            <label htmlFor="name" className="text-sm font-bold text-[#0B2D5B]">
              Nome
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="William"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#00C2D7] focus:outline-none"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="text-sm font-bold text-[#0B2D5B]">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#00C2D7] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-bold text-[#0B2D5B]">
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#00C2D7] focus:outline-none"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        {mode === "login" ? (
          <>
            Não tem conta?{" "}
            <Link href="/cadastro" className="font-bold text-[#00C2D7] hover:underline">
              Cadastre-se
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <Link href="/login" className="font-bold text-[#00C2D7] hover:underline">
              Entrar
            </Link>
          </>
        )}
      </p>
    </Card>
  );
}
