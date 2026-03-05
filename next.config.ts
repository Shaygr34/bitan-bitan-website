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
      { source: '/services/\u05d4\u05d7\u05d6\u05e8-\u05de\u05e1-\u05e9\u05d1\u05d7', destination: '/services/real-estate-tax', permanent: true },
      { source: '/services/\u05e0\u05d9\u05d4\u05d5\u05dc-\u05d3\u05d9\u05d5\u05e0\u05d9\u05dd-\u05de\u05d5\u05dc-\u05e8\u05e9\u05d5\u05d9\u05d5\u05ea-\u05d4\u05de\u05e1', destination: '/services/tax-representation', permanent: true },
      { source: '/services/\u05d4\u05d7\u05d6\u05e8\u05d9-\u05de\u05e1', destination: '/services/tax-refunds', permanent: true },
      { source: '/services/\u05de\u05e2\u05e0\u05e7\u05d9\u05dd', destination: '/services/grants', permanent: true },
    ]
  },
};

export default nextConfig;
