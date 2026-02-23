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

function buildOrganizationJsonLd(s: {
  siteName?: string
  siteDescription?: string
  phone?: string
  email?: string
  address?: string
} | null) {
  const name = s?.siteName ?? 'ביטן את ביטן — רואי חשבון'
  const description =
    s?.siteDescription ??
    'משרד רואי חשבון המעניק שירותי ייעוץ מס, הנהלת חשבונות, דוחות כספיים וליווי עסקי מקצועי.'
  const phone = s?.phone ?? '03-5174295'
  const email = s?.email ?? 'office@bitancpa.com'
  const address = s?.address ?? 'הרכבת 58, מגדל אלקטרה סיטי, קומה 11, תל אביב'

  return {
    '@context': 'https://schema.org',
    '@type': 'AccountingService',
    name,
    description,
    url: SITE_URL,
    telephone: phone,
    email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
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
        <JsonLd data={buildOrganizationJsonLd(settings)} />
        <SiteSettingsProvider settings={settings}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SiteSettingsProvider>
      </body>
    </html>
  )
}
