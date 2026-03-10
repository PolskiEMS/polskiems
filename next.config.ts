import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/admin/raporty/pdf": [
      "./public/fonts/**/*",
      "./node_modules/pdfkit/js/data/*",
    ],
  },
};

export default nextConfig;
