'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'דף הבית', href: '/' },
  { label: 'אודות', href: '/about' },
  { label: 'שירותים', href: '/services' },
  { label: 'מרכז ידע', href: '/knowledge' },
  { label: 'צור קשר', href: '/contact' },
] as const

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
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
          <Link href="/" className="flex items-baseline gap-1 shrink-0">
            <span className="text-primary font-bold text-h4">ביטן את ביטן</span>
            <span className="text-text-muted font-normal text-body-sm">
              רואי חשבון
            </span>
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

      {/* Mobile overlay menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-primary/30"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel — slides from right (start edge in RTL) */}
          <nav className="absolute top-0 end-0 h-full w-[280px] bg-white shadow-xl flex flex-col animate-slide-in">
            {/* Close button */}
            <div className="h-[56px] flex items-center justify-between px-6 border-b border-border">
              <span className="text-primary font-bold text-h4">ביטן את ביטן</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 -m-2 text-primary cursor-pointer"
                aria-label="סגור תפריט"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Links */}
            <div className="flex flex-col py-space-4">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    'px-6 py-3 text-body-lg font-medium text-primary transition-colors duration-fast hover:bg-surface',
                    isActive(href) && 'border-e-[3px] border-gold bg-surface',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
