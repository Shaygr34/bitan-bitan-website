import type { Metadata } from "next";
import {
  SectionHeader,
  Card,
  CardBody,
  LTR,
  WhatsAppCTA,
  PhoneCTA,
} from "@/components/ui";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "צור קשר — ביטן את ביטן רואי חשבון",
  description:
    "צרו קשר עם משרד רואי חשבון ביטן את ביטן — טלפון, דוא״ל, וואטסאפ או ביקור במשרד בתל אביב.",
};

const CONTACT_METHODS = [
  {
    icon: Phone,
    label: "טלפון",
    value: "03-5174295",
    href: "tel:035174295",
    ltr: true,
    external: false,
  },
  {
    icon: Mail,
    label: "דוא\"ל",
    value: "office@bitancpa.com",
    href: "mailto:office@bitancpa.com",
    ltr: true,
    external: false,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+972-52-722-1111",
    href: "https://wa.me/972527221111",
    ltr: true,
    external: true,
  },
  {
    icon: MapPin,
    label: "כתובת",
    value: "הרכבת 58, מגדל אלקטרה סיטי, קומה 11, תל אביב",
    href: undefined,
    ltr: false,
    external: false,
  },
  {
    icon: Clock,
    label: "שעות פעילות",
    value: "ראשון–חמישי 08:30–17:00",
    href: undefined,
    ltr: false,
    external: false,
  },
] as const;

/* Electra Tower, HaRakevet 58, Tel Aviv */
const OFFICE_ADDRESS = 'הרכבת 58, מגדל אלקטרה סיטי, תל אביב';
const OFFICE_ADDRESS_ENCODED = encodeURIComponent(OFFICE_ADDRESS);
const OFFICE_LAT = 32.0688;
const OFFICE_LNG = 34.7898;
/* Embed with place query — shows a red pin on the map */
const GOOGLE_MAPS_EMBED_URL = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${OFFICE_ADDRESS_ENCODED}&language=he&zoom=16`;
/* Waze deep link — coordinates are the most reliable for navigation */
const WAZE_URL = `https://waze.com/ul?ll=${OFFICE_LAT},${OFFICE_LNG}&navigate=yes&z=17`;
/* Google Maps — directions mode triggers navigation */
const GOOGLE_MAPS_URL = `https://www.google.com/maps/dir/?api=1&destination=${OFFICE_LAT},${OFFICE_LNG}&travelmode=driving`;

/** Official Waze brand icon — ghost face (Font Awesome, CC BY 4.0) */
function WazeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <path fill="currentColor" d="M502.17 201.67C516.69 287.53 471.23 369.59 389 409.8c13 34.1-12.4 70.2-48.32 70.2a51.68 51.68 0 0 1-51.57-49c-6.44.19-64.2 0-76.33-.64A51.69 51.69 0 0 1 159 479.92c-33.86-1.36-57.95-34.84-47-67.92-37.21-13.11-72.54-34.87-99.62-70.8-13-17.28-.48-41.8 20.84-41.8 46.31 0 32.22-54.17 43.15-110.26C94.8 95.2 193.12 32 288.09 32c102.48 0 197.15 70.67 214.08 169.67zM373.51 388.28c42-19.18 81.33-56.71 96.29-102.14 40.48-123.09-64.15-228-181.71-228-83.45 0-170.32 55.42-186.07 136-9.53 48.91 5 131.35-68.75 131.35C58.21 358.6 91.6 378.11 127 389.54c24.66-21.8 63.87-15.47 79.83 14.34 14.22 1 79.19 1.18 87.9.82a51.69 51.69 0 0 1 78.78-16.42zM205.12 187.13c0-34.74 50.84-34.75 50.84 0s-50.84 34.74-50.84 0zm116.57 0c0-34.74 50.86-34.75 50.86 0s-50.86 34.75-50.86 0zm-122.61 70.69c-3.44-16.94 22.18-22.18 25.62-5.21l.06.28c4.14 21.42 29.85 44 64.12 43.07 35.68-.94 59.25-22.21 64.11-42.77 4.46-16.05 28.6-10.36 25.47 6-5.23 22.18-31.21 62-91.46 62.9-42.55 0-80.88-27.84-87.9-64.25z"/>
    </svg>
  )
}

/** Google Maps brand icon — colored pin (Google brand colors) */
function GoogleMapsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 92 92" className={className} aria-hidden="true">
      {/* Pin body — red */}
      <path d="M46 4C28.88 4 15 17.88 15 35c0 22.54 27.41 47.76 28.58 48.83a3.5 3.5 0 0 0 4.84 0C49.59 82.76 77 57.54 77 35 77 17.88 63.12 4 46 4z" fill="#EA4335"/>
      {/* Inner circle — white */}
      <circle cx="46" cy="35" r="12" fill="white"/>
      {/* Inner circle accent — blue */}
      <circle cx="46" cy="35" r="7" fill="#4285F4"/>
    </svg>
  )
}

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto">
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
                {CONTACT_METHODS.map(({ icon: Icon, label, value, href, ltr, external }) => (
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
                  href="mailto:office@bitancpa.com"
                  className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary font-medium text-body-sm px-5 py-2.5 rounded-lg hover:bg-primary hover:text-white transition-all duration-base"
                >
                  <Mail className="h-4 w-4" />
                  שלחו מייל
                </a>
              </div>
            </div>

            {/* Contact form */}
            <div>
              <Card hover={false}>
                <CardBody>
                  <h3 className="text-h3 font-bold text-primary mb-space-5">
                    השאירו פרטים
                  </h3>
                  <form className="space-y-space-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-body-sm font-medium text-primary mb-1"
                      >
                        שם מלא
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-4 py-3 border border-border rounded-lg text-body text-primary bg-white placeholder:text-text-muted focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                        placeholder="הכניסו את שמכם"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-body-sm font-medium text-primary mb-1"
                      >
                        טלפון
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        dir="ltr"
                        className="w-full px-4 py-3 border border-border rounded-lg text-body text-primary bg-white placeholder:text-text-muted focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-start"
                        placeholder="050-000-0000"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-body-sm font-medium text-primary mb-1"
                      >
                        דוא&quot;ל
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        dir="ltr"
                        className="w-full px-4 py-3 border border-border rounded-lg text-body text-primary bg-white placeholder:text-text-muted focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-start"
                        placeholder="example@email.com"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-body-sm font-medium text-primary mb-1"
                      >
                        הודעה
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        className="w-full px-4 py-3 border border-border rounded-lg text-body text-primary bg-white placeholder:text-text-muted focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-none"
                        placeholder="ספרו לנו כיצד נוכל לעזור..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 bg-gold text-primary font-bold text-body py-3 rounded-lg hover:bg-gold-hover hover:scale-[1.03] active:scale-[0.97] transition-all duration-base cursor-pointer"
                    >
                      שליחה
                    </button>
                    <p className="text-text-muted text-caption text-center">
                      נחזור אליכם תוך יום עסקים אחד.
                    </p>
                  </form>
                </CardBody>
              </Card>
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
                src={GOOGLE_MAPS_EMBED_URL}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="מיקום המשרד — מגדל אלקטרה סיטי, תל אביב"
                className="absolute inset-0 w-full h-full"
              />
            </div>

            {/* Address bar + navigation buttons */}
            <div className="bg-white px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-body font-medium text-primary">
                    הרכבת 58, מגדל אלקטרה סיטי, קומה 11
                  </p>
                  <p className="text-body-sm text-text-muted">תל אביב</p>
                </div>
              </div>

              <div className="flex gap-3 shrink-0">
                <a
                  href={WAZE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#30B6FC] text-white font-bold text-body-sm px-5 py-2.5 rounded-lg hover:bg-[#1DA1E6] transition-all"
                >
                  <WazeIcon className="h-5 w-5" />
                  נווט ב-Waze
                </a>
                <a
                  href={GOOGLE_MAPS_URL}
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
    </div>
  );
}
