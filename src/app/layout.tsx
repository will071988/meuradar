import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "MeuRadar — A informação que importa para você",
  description:
    "Notícias, clima, mercado, preços, oportunidades, esportes e informações personalizadas em um só lugar.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "MeuRadar — A informação que importa para você",
    description:
      "Notícias, clima, mercado, preços, oportunidades, esportes e informações personalizadas em um só lugar.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
