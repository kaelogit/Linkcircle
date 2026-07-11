import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**/*": [
      "./data/**/*",
      "./node_modules/@swc/helpers/esm/**/*",
    ],
  },
};

export default nextConfig;
