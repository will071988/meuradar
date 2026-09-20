import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Entrar — MeuRadar",
  description: "Acesse sua conta do MeuRadar.",
};

export default function LoginPage() {
  return (
    <div className="py-6">
      <AuthForm mode="login" />
    </div>
  );
}
