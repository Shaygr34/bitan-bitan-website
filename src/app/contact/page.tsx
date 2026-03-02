import type { Metadata } from "next";
import {
  SectionHeader,
  LTR,
  WhatsAppCTA,
  PhoneCTA,
} from "@/components/ui";
import { ContactForm } from "./ContactForm";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { getSiteSettings } from "@/sanity/queries";
import { TrustModule } from "@/components/TrustModule";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: 'צור קשר',
  description:
    'צרו קשר עם משרד רואי חשבון ביטן את ביטן — טלפון, דוא״ל, וואטסאפ או ביקור במשרד בתל אביב.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'צור קשר — ביטן את ביטן רואי חשבון',
    description:
      'צרו קשר עם משרד רואי חשבון ביטן את ביטן — טלפון, דוא״ל, וואטסאפ או ביקור במשרד.',
  },
};

function WhatsAppContactIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ─── Map defaults — use "ביטן את ביטן פיננסים" as canonical search term ─── */
const BUSINESS_NAME = 'ביטן את ביטן פיננסים'
const BUSINESS_NAME_ENCODED = encodeURIComponent(BUSINESS_NAME)
const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''
const DEFAULT_EMBED_URL = `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${BUSINESS_NAME_ENCODED}&language=he&zoom=16`
const DEFAULT_WAZE_URL = `https://waze.com/ul?q=${BUSINESS_NAME_ENCODED}&navigate=yes&z=17`
const DEFAULT_GMAPS_URL = `https://www.google.com/maps/search/?api=1&query=${BUSINESS_NAME_ENCODED}`

/** Official Waze brand icon */
function WazeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <path fill="currentColor" d="M502.17 201.67C516.69 287.53 471.23 369.59 389 409.8c13 34.1-12.4 70.2-48.32 70.2a51.68 51.68 0 0 1-51.57-49c-6.44.19-64.2 0-76.33-.64A51.69 51.69 0 0 1 159 479.92c-33.86-1.36-57.95-34.84-47-67.92-37.21-13.11-72.54-34.87-99.62-70.8-13-17.28-.48-41.8 20.84-41.8 46.31 0 32.22-54.17 43.15-110.26C94.8 95.2 193.12 32 288.09 32c102.48 0 197.15 70.67 214.08 169.67zM373.51 388.28c42-19.18 81.33-56.71 96.29-102.14 40.48-123.09-64.15-228-181.71-228-83.45 0-170.32 55.42-186.07 136-9.53 48.91 5 131.35-68.75 131.35C58.21 358.6 91.6 378.11 127 389.54c24.66-21.8 63.87-15.47 79.83 14.34 14.22 1 79.19 1.18 87.9.82a51.69 51.69 0 0 1 78.78-16.42zM205.12 187.13c0-34.74 50.84-34.75 50.84 0s-50.84 34.74-50.84 0zm116.57 0c0-34.74 50.86-34.75 50.86 0s-50.86 34.75-50.86 0zm-122.61 70.69c-3.44-16.94 22.18-22.18 25.62-5.21l.06.28c4.14 21.42 29.85 44 64.12 43.07 35.68-.94 59.25-22.21 64.11-42.77 4.46-16.05 28.6-10.36 25.47 6-5.23 22.18-31.21 62-91.46 62.9-42.55 0-80.88-27.84-87.9-64.25z"/>
    </svg>
  )
}

/** Google Maps brand icon */
function GoogleMapsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 92 92" className={className} aria-hidden="true">
      <path d="M46 4C28.88 4 15 17.88 15 35c0 22.54 27.41 47.76 28.58 48.83a3.5 3.5 0 0 0 4.84 0C49.59 82.76 77 57.54 77 35 77 17.88 63.12 4 46 4z" fill="#EA4335"/>
      <circle cx="46" cy="35" r="12" fill="white"/>
      <circle cx="46" cy="35" r="7" fill="#4285F4"/>
    </svg>
  )
}

export default async function ContactPage() {
  const s = await getSiteSettings()

  const phone = s?.phone ?? '03-5174295'
  const phoneTel = phone.replace(/[^+\d]/g, '')
  const email = s?.email ?? 'office@bitancpa.com'
  const whatsapp = s?.whatsapp ?? '+972527221111'
  const whatsappClean = whatsapp.replace(/[^0-9]/g, '')
  const whatsappDisplay = whatsapp.replace(/(\+972)(\d{2})(\d{3})(\d{4})/, '$1-$2-$3-$4')
  const address = s?.address ?? 'הרכבת 58, מגדל אלקטרה סיטי, קומה 11, תל אביב'
  const officeHours = s?.officeHours ?? 'ראשון–חמישי 08:30–17:00'

  const wazeUrl = s?.wazeUrl ?? DEFAULT_WAZE_URL
  const gmapsUrl = s?.googleMapsUrl ?? DEFAULT_GMAPS_URL
  const embedUrl = s?.googleMapsEmbedUrl ?? DEFAULT_EMBED_URL

  const contactMethods = [
    {
      icon: Phone,
      label: "טלפון",
      value: phone,
      href: `tel:${phoneTel}`,
      ltr: true,
      external: false,
    },
    {
      icon: Mail,
      label: 'דוא"ל',
      value: email,
      href: `mailto:${email}`,
      ltr: true,
      external: false,
    },
    {
      icon: WhatsAppContactIcon,
      label: "WhatsApp",
      value: whatsappDisplay,
      href: `https://wa.me/${whatsappClean}`,
      ltr: true,
      external: true,
    },
    {
      icon: MapPin,
      label: "כתובת",
      value: address,
      href: undefined as string | undefined,
      ltr: false,
      external: false,
    },
    {
      icon: Clock,
      label: "שעות פעילות",
      value: officeHours,
      href: undefined as string | undefined,
      ltr: false,
      external: false,
    },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <div className="mb-space-4 [&_a]:text-white/60 [&_a:hover]:text-white [&_span]:text-white/80 [&_svg]:text-white/40">
            <Breadcrumb items={[{ label: 'צור קשר' }]} />
          </div>
          <h1 className="text-white text-h1 font-bold">צור קשר</h1>
          <span className="gold-underline mt-4" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow">
            נשמח לשמוע מכם. צרו קשר בכל דרך שנוחה לכם — נחזור אליכם תוך 24
            שעות.
          </p>
        </div>
      </section>

      {/* Contact info + Form */}
      <section className="py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <div className="grid md:grid-cols-2 gap-space-8">
            {/* Contact details */}
            <div>
              <SectionHeader subtitle="אפשר לפנות אלינו בכל אחת מהדרכים הבאות.">
                פרטי התקשרות
              </SectionHeader>

              <div className="mt-space-6 space-y-space-4">
                {contactMethods.map(({ icon: Icon, label, value, href, ltr, external }) => (
                  <div key={label} className="flex items-start gap-space-3">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-body-sm text-text-muted">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          className="text-body font-medium text-primary hover:text-primary-light transition-colors"
                          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                          {ltr ? <LTR>{value}</LTR> : value}
                        </a>
                      ) : (
                        <p className="text-body font-medium text-primary">
                          {ltr ? <LTR>{value}</LTR> : value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mt-space-7">
                <WhatsAppCTA label="WhatsApp" size="md" />
                <PhoneCTA size="md" />
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary font-medium text-body-sm px-5 py-2.5 rounded-lg hover:bg-primary hover:text-white transition-all duration-base"
                >
                  <Mail className="h-4 w-4" />
                  שלחו מייל
                </a>
              </div>
            </div>

            {/* Contact form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Map section */}
      <section className="bg-surface py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <SectionHeader centered>
            איך מגיעים?
          </SectionHeader>

          <div className="mt-space-7 rounded-xl overflow-hidden border border-border shadow-lg">
            {/* Embedded Google Map */}
            <div className="relative h-[350px] md:h-[450px]">
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="מיקום המשרד — ביטן את ביטן פיננסים, מגדל אלקטרה סיטי, תל אביב"
                className="absolute inset-0 w-full h-full"
              />
            </div>

            {/* Address bar + navigation buttons */}
            <div className="bg-white px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-body font-medium text-primary">{address}</p>
                </div>
              </div>

              <div className="flex gap-3 shrink-0">
                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#30B6FC] text-white font-bold text-body-sm px-5 py-2.5 rounded-lg hover:bg-[#1DA1E6] transition-all"
                >
                  <WazeIcon className="h-5 w-5" />
                  נווט ב-Waze
                </a>
                <a
                  href={gmapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white border-2 border-[#4285F4] text-[#4285F4] font-bold text-body-sm px-5 py-2.5 rounded-lg hover:bg-[#4285F4] hover:text-white transition-all"
                >
                  <GoogleMapsIcon className="h-5 w-5" />
                  Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Module — process + prepare docs */}
      <TrustModule showProcess={true} showPrepare={true} />
    </div>
  );
}
