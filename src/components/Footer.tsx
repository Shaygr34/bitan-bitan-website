'use client'

import Link from 'next/link'
import { LTR } from '@/components/ui'
import { Phone, Mail, MapPin, Clock, Facebook, Linkedin, Instagram } from 'lucide-react'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

import { useSiteSettings } from '@/components/SiteSettingsContext'
import { trackPhoneClick, trackWhatsAppClick } from '@/lib/analytics'

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com/bitancpa/?locale=he_IL', icon: Facebook },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
  { label: 'Instagram', href: 'https://www.instagram.com/bitancpa/', icon: Instagram },
] as const

const NAV_LINKS = [
  { label: 'דף הבית', href: '/' },
  { label: 'אודות', href: '/about' },
  { label: 'שירותים', href: '/services' },
  { label: 'מרכז ידע', href: '/knowledge' },
  { label: 'שאלות נפוצות', href: '/faq' },
  { label: 'צור קשר', href: '/contact' },
] as const

const LEGAL_LINKS = [
  { label: 'מדיניות פרטיות', href: '/privacy' },
  { label: 'תנאי שימוש', href: '/terms' },
] as const

export function Footer() {
  const s = useSiteSettings()

  const phone = s?.phone ?? '03-5174295'
  const fax = s?.fax ?? '03-5174298'
  const email = s?.email ?? 'office@bitancpa.com'
  const address = s?.address ?? 'הרכבת 58, מגדל אלקטרה סיטי, קומה 11, תל אביב'
  const officeHours = s?.officeHours ?? 'ראשון–חמישי 08:30–17:00'
  const whatsapp = s?.whatsapp ?? '+972527221111'
  const whatsappClean = whatsapp.replace(/[^0-9]/g, '')

  return (
    <footer className="bg-white border-t border-border">
      <div className="max-w-content mx-auto px-6 py-space-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-8">
          {/* Column 1: Firm info + contact */}
          <div>
            <p className="text-primary font-bold text-body-lg">
              {s?.siteName ?? 'ביטן את ביטן — רואי חשבון'}
            </p>

            <ul className="mt-space-4 space-y-space-3 text-body-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-text-muted" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-text-muted" />
                <a
                  href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                  className="hover:text-primary transition-colors"
                  onClick={() => trackPhoneClick('footer')}
                >
                  <LTR>{phone}</LTR>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-text-muted" />
                <span className="text-text-muted">פקס:</span>
                <LTR>{fax}</LTR>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-text-muted" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-primary transition-colors"
                >
                  <LTR>{email}</LTR>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-text-muted" />
                <a
                  href={`https://wa.me/${whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  onClick={() => trackWhatsAppClick('footer')}
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-text-muted" />
                <span>{officeHours}</span>
              </li>
            </ul>
          </div>

          {/* Column 2: Nav links */}
          <div>
            <p className="text-primary font-bold text-body mb-space-3">ניווט</p>
            <ul className="space-y-space-2">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-body-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal links + Social */}
          <div>
            <p className="text-primary font-bold text-body mb-space-3">מידע משפטי</p>
            <ul className="space-y-space-2">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-body-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social media */}
            <p className="text-primary font-bold text-body mt-space-5 mb-space-3">עקבו אחרינו</p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-text-muted hover:bg-primary hover:text-white transition-all duration-base"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar: disclaimer + copyright */}
        <div className="mt-space-7 pt-space-4 border-t border-border-light text-text-muted text-caption space-y-1">
          <p>
            המידע באתר הינו כללי בלבד ואינו מהווה תחליף לייעוץ מקצועי פרטני.
          </p>
          <p>
            © {new Date().getFullYear()} {s?.siteName ?? 'ביטן את ביטן — רואי חשבון'}. כל הזכויות
            שמורות.
          </p>
        </div>
      </div>
    </footer>
  )
}
