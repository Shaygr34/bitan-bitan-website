'use client'

import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID

/**
 * Loads the GA4 gtag.js snippet.
 * Renders nothing when NEXT_PUBLIC_GA4_ID is not set.
 */
export function GoogleAnalytics() {
  if (!GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            send_page_view: true,
          });
        `}
      </Script>
    </>
  )
}
