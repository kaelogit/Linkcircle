import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingIncludes: {
    "*": ["./data/**/*"],
  },
};

export default nextConfig;
