import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    host: "https://polskiems.pl",
    sitemap: "https://polskiems.pl/sitemap.xml",
  };
}
