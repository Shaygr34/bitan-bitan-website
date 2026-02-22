'use client'

import { Phone } from 'lucide-react'
import { Button } from './Button'
import { LTR } from './LTR'

type PhoneCTAProps = {
  phone?: string
  label?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function trackPhoneClick() {
  // gtag event stub — will be wired to Google Analytics in a later milestone
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const g = (window as Record<string, unknown>).gtag as
      | ((...args: unknown[]) => void)
      | undefined
    g?.('event', 'phone_click', {
      event_category: 'contact',
      event_label: 'phone_cta',
    })
  }
}

export function PhoneCTA({
  phone = '03-5174295',
  label,
  variant = 'primary',
  size = 'md',
  className = '',
}: PhoneCTAProps) {
  const telHref = `tel:${phone.replace(/[^+\d]/g, '')}`

  return (
    <Button
      href={telHref}
      variant={variant}
      size={size}
      icon={Phone}
      iconPosition="start"
      className={className}
      onClick={trackPhoneClick}
    >
      {label ?? <LTR>{phone}</LTR>}
    </Button>
  )
}
