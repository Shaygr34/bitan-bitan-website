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
      // ── English WP slugs → specific articles ──────────────────
      { source: '/woman-pregnent', destination: '/knowledge/women-employment-maternity-leave', permanent: true },
      { source: '/6068-2', destination: '/knowledge/annual-companies-registrar-fee-2020', permanent: true },
      { source: '/companytax', destination: '/knowledge/company-capital-gains-tax-spreading', permanent: true },
      { source: '/compensation', destination: '/knowledge/vat-on-contract-compensation', permanent: true },
      { source: '/change-address', destination: '/knowledge/changing-company-address', permanent: true },
      { source: '/change-your-company-name', destination: '/knowledge/changing-company-name', permanent: true },
      { source: '/check-your-rights', destination: '/knowledge', permanent: true },
      { source: '/birthandtax', destination: '/knowledge', permanent: true },
      { source: '/car-tex', destination: '/knowledge', permanent: true },
      { source: '/cash-low', destination: '/knowledge', permanent: true },

      // ── חרבות ברזל (Iron Swords) old WP URLs → grants article ─
      // Next.js requires percent-encoded sources for Hebrew URLs
      { source: '/%D7%9E%D7%A2%D7%A0%D7%A7-%D7%97%D7%A8%D7%91%D7%95%D7%AA-%D7%91%D7%A8%D7%96%D7%9C', destination: '/knowledge/business-grants-operation-shaagat-haari-2026', permanent: true },
      { source: '/%D7%97%D7%A8%D7%91%D7%95%D7%AA-%D7%91%D7%A8%D7%96%D7%9C', destination: '/knowledge/business-grants-operation-shaagat-haari-2026', permanent: true },
      { source: '/%D7%9E%D7%A2%D7%A0%D7%A7%D7%99%D7%9D-%D7%97%D7%A8%D7%91%D7%95%D7%AA-%D7%91%D7%A8%D7%96%D7%9C', destination: '/knowledge/business-grants-operation-shaagat-haari-2026', permanent: true },
      { source: '/%D7%9E%D7%A2%D7%A0%D7%A7-%D7%97%D7%A8%D7%91%D7%95%D7%AA-%D7%91%D7%A8%D7%96%D7%9C-%D7%9C%D7%A2%D7%A1%D7%A7%D7%99%D7%9D', destination: '/knowledge/business-grants-operation-shaagat-haari-2026', permanent: true },
      { source: '/%D7%9E%D7%9C%D7%97%D7%9E%D7%AA-%D7%97%D7%A8%D7%91%D7%95%D7%AA-%D7%91%D7%A8%D7%96%D7%9C', destination: '/knowledge/business-grants-operation-shaagat-haari-2026', permanent: true },

      // ── Team bios → about ─────────────────────────────────────
      { source: '/avi_bitan', destination: '/about', permanent: true },
      { source: '/ron_bitan', destination: '/about', permanent: true },
      { source: '/shlomo_bitan', destination: '/about', permanent: true },

      // ── English WP slugs → knowledge hub ──────────────────────
      { source: '/homer_roe_heshbon', destination: '/knowledge', permanent: true },
      { source: '/purchasetax', destination: '/knowledge', permanent: true },
      { source: '/banking', destination: '/knowledge', permanent: true },
      { source: '/divident', destination: '/knowledge', permanent: true },
      { source: '/pension', destination: '/knowledge', permanent: true },
      { source: '/invoice', destination: '/knowledge', permanent: true },

      // ── Catch-all patterns for old WP URL structures ──────────
      { source: '/category/:path*', destination: '/knowledge', permanent: true },
      { source: '/tag/:path*', destination: '/knowledge', permanent: true },
      { source: '/page/:path*', destination: '/', permanent: true },
      { source: '/wp-content/uploads/:path*', destination: '/', permanent: true },
      { source: '/:year(\\d{4})/:month(\\d{2})/:slug', destination: '/knowledge', permanent: true },
      { source: '/author/:path*', destination: '/about', permanent: true },
    ]
  },
};

export default nextConfig;
