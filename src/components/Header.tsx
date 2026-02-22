'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { EASE_OUT_QUART } from '@/lib/motion'

const NAV_LINKS = [
  { label: 'דף הבית', href: '/' },
  { label: 'אודות', href: '/about' },
  { label: 'שירותים', href: '/services' },
  { label: 'מרכז ידע', href: '/knowledge' },
  { label: 'צור קשר', href: '/contact' },
] as const

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showStickyCTA, setShowStickyCTA] = useState(false)

  // Shadow on scroll + sticky CTA visibility
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 0)
      setShowStickyCTA(window.scrollY > 600)
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
          'h-[56px] md:h-[72px]',
          scrolled && 'shadow-md',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="max-w-content mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo — right side (RTL: first in DOM = right) */}
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="ביטן את ביטן — רואי חשבון"
              width={200}
              height={56}
              className="h-10 md:h-14 w-auto"
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
              <div className="h-[56px] flex items-center justify-between px-6 border-b border-border">
                <Image
                  src="/logo.png"
                  alt="ביטן את ביטן — רואי חשבון"
                  width={120}
                  height={36}
                  className="h-8 w-auto"
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
              href="https://wa.me/972527221111"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gold text-primary font-bold text-body-sm py-2.5 rounded-lg hover:bg-gold-hover transition-colors"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href="tel:035174295"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white font-medium text-body-sm py-2.5 rounded-lg hover:bg-primary-light transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span dir="ltr">03-5174295</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
