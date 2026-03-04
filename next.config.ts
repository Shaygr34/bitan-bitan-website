import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },

  async redirects() {
    return [
      // Legacy URL patterns — add redirects here when replacing an existing site
      // Example:
      // { source: '/old-page', destination: '/new-page', permanent: true },
    ]
  },
};

export default nextConfig;
