import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { PageTransition } from '@/components/PageTransition'
import { SiteSettingsProvider } from '@/components/SiteSettingsContext'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { JsonLd } from '@/components/JsonLd'
import { getSiteSettings } from '@/sanity/queries'
import { urlFor } from '@/sanity/image'
import { SITE_URL } from '@/lib/site-url'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const ogImageUrl = urlFor(settings?.ogImage, 1200)

  return {
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
      images: [{ url: ogImageUrl || '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImageUrl || '/og-image.png'],
    },
    alternates: {
      canonical: '/',
    },
  }
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
      opens: '09:00',
      closes: '17:00',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Israel',
    },
    inLanguage: 'he',
  }
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSiteSettings()

  return (
    <>
      <GoogleAnalytics />
      <JsonLd data={buildOrganizationJsonLd(settings)} />
      <SiteSettingsProvider settings={settings}>
        <Header />
        <main className="flex-1 pb-[var(--mobile-cta-height)] md:pb-0">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <WhatsAppButton />
      </SiteSettingsProvider>
    </>
  )
}
