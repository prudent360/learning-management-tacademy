import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Traces only the files each route actually needs into .next/standalone,
  // so the production Docker image doesn't need to ship node_modules.
  output: "standalone",
  experimental: {
    cpus: 1,
  },

  // Static, unconditional redirect — kept out of the page component itself
  // because calling redirect() during render under a Suspense boundary
  // (every /admin/* route inherits admin/loading.tsx) doesn't reliably
  // resolve on the client in this app's Next.js version.
  async redirects() {
    return [
      {
        source: "/admin/settings",
        destination: "/admin/settings/general",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
