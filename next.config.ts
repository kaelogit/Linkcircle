import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Vercel Node lambdas can miss @swc/helpers ESM files and crash with
  // MIDDLEWARE_INVOCATION_FAILED / FUNCTION_INVOCATION_FAILED.
  outputFileTracingIncludes: {
    "*": [
      "./data/**/*",
      "./node_modules/@swc/helpers/esm/**/*",
      "./node_modules/@swc/helpers/cjs/**/*",
    ],
  },
};

export default nextConfig;
