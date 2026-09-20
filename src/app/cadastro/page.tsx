import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Criar conta — MeuRadar",
  description: "Crie sua conta gratuita no MeuRadar.",
};

export default function CadastroPage() {
  return (
    <div className="py-6">
      <AuthForm mode="signup" />
    </div>
  );
}
