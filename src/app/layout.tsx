import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const viewport: Viewport = {
  themeColor: "#0B2D5B",
};

export const metadata: Metadata = {
  title: "MeuRadar — A informação que importa para você",
  description:
    "Notícias, clima, mercado, preços, oportunidades, esportes e informações personalizadas em um só lugar.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MeuRadar",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/apple-touch-icon.png",
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
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
