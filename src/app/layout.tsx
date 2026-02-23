import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { SiteSettingsProvider } from '@/components/SiteSettingsContext'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { JsonLd } from '@/components/JsonLd'
import { getSiteSettings } from '@/sanity/queries'
import { SITE_URL } from '@/lib/site-url'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  display: 'swap',
  variable: '--font-heebo',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'ביטן את ביטן — רואי חשבון',
    template: '%s | ביטן את ביטן',
  },
  description:
    'משרד רואי חשבון ביטן את ביטן — ייעוץ מס, הנהלת חשבונות, דוחות כספיים וליווי עסקי מקצועי. תל אביב.',
  openGraph: {
    siteName: 'ביטן את ביטן — רואי חשבון',
    locale: 'he_IL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: '/',
  },
}

const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'AccountingService',
  name: 'ביטן את ביטן — רואי חשבון',
  description:
    'משרד רואי חשבון המעניק שירותי ייעוץ מס, הנהלת חשבונות, דוחות כספיים וליווי עסקי מקצועי.',
  url: SITE_URL,
  telephone: '03-5174295',
  email: 'office@bitancpa.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'הרכבת 58, מגדל אלקטרה סיטי, קומה 11',
    addressLocality: 'תל אביב',
    addressCountry: 'IL',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    opens: '08:30',
    closes: '17:00',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Israel',
  },
  inLanguage: 'he',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSiteSettings()

  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-heebo min-h-screen flex flex-col">
        <GoogleAnalytics />
        <JsonLd data={ORGANIZATION_JSONLD} />
        <SiteSettingsProvider settings={settings}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SiteSettingsProvider>
      </body>
    </html>
  )
}
