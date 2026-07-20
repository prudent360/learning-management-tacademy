import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Traces only the files each route actually needs into .next/standalone,
  // so the production Docker image doesn't need to ship node_modules.
  output: "standalone",
};

export default nextConfig;
