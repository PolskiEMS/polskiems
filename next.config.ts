import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/admin/raporty/pdf": [
      "./node_modules/pdfkit/js/data/**/*",
      "./public/fonts/**/*",
    ],
  },
};

export default nextConfig;
