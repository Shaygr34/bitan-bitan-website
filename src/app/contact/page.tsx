import type { Metadata } from "next";
import {
  SectionHeader,
  Card,
  CardBody,
  LTR,
  WhatsAppCTA,
  PhoneCTA,
} from "@/components/ui";
import { Phone, Mail, MapPin, Clock, MessageCircle, Navigation, ExternalLink } from "lucide-react";

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
const OFFICE_LAT = 32.06375;
const OFFICE_LNG = 34.78955;
const GOOGLE_MAPS_EMBED_URL = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1691.5!2d${OFFICE_LNG}!3d${OFFICE_LAT}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d4b9c1f22bf4d%3A0x502ba309bf77a4a2!2sElectra%20Tower!5e0!3m2!1siw!2sil!4v1700000000000`;
const WAZE_URL = `https://waze.com/ul?ll=${OFFICE_LAT},${OFFICE_LNG}&navigate=yes&z=17`;
const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${OFFICE_LAT},${OFFICE_LNG}`;

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
                  className="inline-flex items-center gap-2 bg-[#33CCFF] text-white font-bold text-body-sm px-5 py-2.5 rounded-lg hover:brightness-110 transition-all"
                >
                  <Navigation className="h-4 w-4" />
                  נווט ב-Waze
                </a>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-primary text-primary font-medium text-body-sm px-5 py-2.5 rounded-lg hover:bg-primary hover:text-white transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
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
