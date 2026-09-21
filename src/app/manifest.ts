import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MeuRadar — A informação que importa para você",
    short_name: "MeuRadar",
    description:
      "Notícias, clima, mercado, preços, oportunidades, esportes e informações personalizadas em um só lugar.",
    start_url: "/",
    display: "standalone",
    background_color: "#EAF2F8",
    theme_color: "#0B2D5B",
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
