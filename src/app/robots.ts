import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin"],
    },
    host: "https://polskiems.pl",
    sitemap: "https://polskiems.pl/sitemap.xml",
  };
}
