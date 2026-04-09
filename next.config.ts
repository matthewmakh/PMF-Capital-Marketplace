import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Limit build workers to prevent OOM/thread exhaustion on Railway
    cpus: 1,
  },
};

export default nextConfig;
