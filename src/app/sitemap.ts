import type { MetadataRoute } from "next";

const routes = [
  "",
  "/meu-radar",
  "/clima",
  "/noticias",
  "/mercado",
  "/precos",
  "/vagas",
  "/esportes",
  "/ferramentas",
  "/conta",
  "/pro",
  "/configuracoes",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://meuradar.vercel.app";
  const now = new Date();
  return routes.map((route) => ({
    url: `${base}${route || "/"}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
