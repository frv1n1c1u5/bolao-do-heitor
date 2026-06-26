import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bolao do Heitor",
    short_name: "Heitor",
    description:
      "Bolao de futebol mobile-first com Pix manual, ranking e historico.",
    start_url: "/entrar",
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#0f766e",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
