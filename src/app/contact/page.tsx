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
  },
  {
    icon: Mail,
    label: "דוא\"ל",
    value: "office@bitancpa.com",
    href: "mailto:office@bitancpa.com",
    ltr: true,
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
  },
  {
    icon: Clock,
    label: "שעות פעילות",
    value: "ראשון–חמישי 08:30–17:00",
    href: undefined,
    ltr: false,
  },
] as const;

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
              </div>
            </div>

            {/* Contact form placeholder */}
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

      {/* Map placeholder */}
      <section className="bg-surface py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <SectionHeader centered>
            איך מגיעים?
          </SectionHeader>
          <div className="mt-space-7 rounded-xl overflow-hidden border border-border bg-callout h-[300px] md:h-[400px] flex items-center justify-center">
            <div className="text-center text-text-muted">
              <MapPin className="h-12 w-12 mx-auto mb-space-3 text-border" />
              <p className="text-body">
                הרכבת 58, מגדל אלקטרה סיטי, קומה 11
              </p>
              <p className="text-body-sm mt-1">תל אביב</p>
              <a
                href="https://maps.google.com/?q=הרכבת+58+תל+אביב+מגדל+אלקטרה+סיטי"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-space-3 text-body-sm font-medium text-gold hover:text-gold-hover transition-colors"
              >
                פתח ב-Google Maps ←
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
