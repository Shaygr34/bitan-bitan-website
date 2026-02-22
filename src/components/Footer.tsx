'use client'

import Link from 'next/link'
import { LTR } from '@/components/ui'
import { Phone, Mail, MapPin, Clock, MessageCircle, Facebook, Linkedin, Instagram } from 'lucide-react'
import { useSiteSettings } from '@/components/SiteSettingsContext'

const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#', icon: Facebook },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
  { label: 'Instagram', href: '#', icon: Instagram },
] as const

const NAV_LINKS = [
  { label: 'דף הבית', href: '/' },
  { label: 'אודות', href: '/about' },
  { label: 'שירותים', href: '/services' },
  { label: 'מרכז ידע', href: '/knowledge' },
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
                <MessageCircle className="h-4 w-4 shrink-0 text-text-muted" />
                <a
                  href={`https://wa.me/${whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
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
