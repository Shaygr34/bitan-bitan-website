'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { EASE_OUT_QUART } from '@/lib/motion'
import { useSiteSettings } from '@/components/SiteSettingsContext'
import { trackWhatsAppClick, trackPhoneClick } from '@/lib/analytics'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'

const NAV_LINKS = [
  { label: 'דף הבית', href: '/' },
  { label: 'אודות', href: '/about' },
  { label: 'שירותים', href: '/services' },
  { label: 'מרכז ידע', href: '/knowledge' },
  { label: 'שאלות נפוצות', href: '/faq' },
  { label: 'צור קשר', href: '/contact' },
] as const

/** Scroll distance in pixels before showing the sticky mobile CTA bar */
const STICKY_CTA_THRESHOLD = 600

export function Header() {
  const pathname = usePathname()
  const s = useSiteSettings()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showStickyCTA, setShowStickyCTA] = useState(false)

  const phone = s?.phone ?? '03-5174295'
  const phoneDigits = phone.replace(/[^+\d]/g, '')
  const phoneTel = phoneDigits.startsWith('+') ? phoneDigits : `+972${phoneDigits.replace(/^0/, '')}`
  const whatsapp = s?.whatsapp ?? '+972527221111'
  const whatsappClean = whatsapp.replace(/[^0-9]/g, '')

  // Shadow on scroll + sticky CTA visibility
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 0)
      setShowStickyCTA(window.scrollY > STICKY_CTA_THRESHOLD)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <header
        className={[
          'sticky top-0 z-50 bg-white border-b border-border transition-shadow duration-base',
          'h-[var(--navbar-height-mobile)] md:h-[var(--navbar-height-desktop)]',
          scrolled && 'shadow-md',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="max-w-content mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo — right side (RTL: first in DOM = right) */}
          <Link href="/" className="shrink-0">
            <Image
              src="/logo-header.png"
              alt="ביטן את ביטן — רואי חשבון"
              width={160}
              height={43}
              className="w-[130px] md:w-[160px] h-auto"
              priority
            />
          </Link>

          {/* Desktop nav — flex-1 + justify-center keeps links visually centered */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-space-5">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'relative text-nav font-medium text-primary transition-colors duration-fast hover:text-primary-light py-1',
                  isActive(href) &&
                    'after:absolute after:bottom-0 after:inset-x-0 after:h-[3px] after:bg-gold after:rounded-full',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger — left side (RTL: last in DOM = left) */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 -m-2 text-primary cursor-pointer"
            aria-label="פתח תפריט"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile overlay menu with AnimatePresence */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-primary/30"
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel — slides from right (start edge in RTL) */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
              className="absolute top-0 end-0 h-full w-[280px] bg-white shadow-xl flex flex-col"
            >
              {/* Close button */}
              <div className="h-[var(--navbar-height-mobile)] flex items-center justify-between px-6 border-b border-border">
                <Image
                  src="/logo-header.png"
                  alt="ביטן את ביטן — רואי חשבון"
                  width={130}
                  height={35}
                  className="w-[130px] h-auto"
                />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-2 -m-2 text-primary cursor-pointer"
                  aria-label="סגור תפריט"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Links with stagger */}
              <div className="flex flex-col py-space-4">
                {NAV_LINKS.map(({ label, href }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.25, ease: EASE_OUT_QUART }}
                  >
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={[
                        'block px-6 py-3 text-body-lg font-medium text-primary transition-colors duration-fast hover:bg-surface',
                        isActive(href) && 'border-e-[3px] border-gold bg-surface',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>

      {/* Sticky mobile CTA bar — appears after scrolling past hero */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
            className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-border shadow-lg px-4 py-3 flex gap-3"
          >
            <a
              href={`https://wa.me/${whatsappClean}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('header_sticky')}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gold text-primary font-bold text-body-sm py-2.5 rounded-lg hover:bg-gold-hover transition-colors"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={`tel:${phoneTel}`}
              onClick={() => trackPhoneClick('header_sticky')}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white font-medium text-body-sm py-2.5 rounded-lg hover:bg-primary-light transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span dir="ltr">{phone}</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
