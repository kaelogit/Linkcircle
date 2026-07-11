import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  outputFileTracingIncludes: {
    "*": [
      "./data/**/*",
      "./node_modules/@swc/helpers/**/*",
    ],
  },
};

export default nextConfig;
