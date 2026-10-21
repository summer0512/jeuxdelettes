import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jeux de Lettres - Sutom",
    short_name: "Sutom",
    description: "Jouez à Sutom : mot du jour, mode infini et défis personnalisés en français.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef2f9",
    theme_color: "#d92d2d",
    lang: "fr-FR",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png"
      }
    ]
  };
}
