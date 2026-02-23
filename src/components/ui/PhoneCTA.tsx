'use client'

import { Phone } from 'lucide-react'
import { Button } from './Button'
import { LTR } from './LTR'
import { trackPhoneClick } from '@/lib/analytics'
import { useSiteSettings } from '@/components/SiteSettingsContext'

type PhoneCTAProps = {
  phone?: string
  label?: string
  location?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PhoneCTA({
  phone,
  label,
  location = 'cta',
  variant = 'primary',
  size = 'md',
  className = '',
}: PhoneCTAProps) {
  const s = useSiteSettings()
  const resolvedPhone = phone ?? s?.phone ?? '03-5174295'
  const resolvedLabel = label ?? s?.ctaPhoneLabel
  const telHref = `tel:${resolvedPhone.replace(/[^+\d]/g, '')}`

  return (
    <Button
      href={telHref}
      variant={variant}
      size={size}
      icon={Phone}
      iconPosition="start"
      className={className}
      onClick={() => trackPhoneClick(location)}
    >
      {resolvedLabel ?? <LTR>{resolvedPhone}</LTR>}
    </Button>
  )
}
