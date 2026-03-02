'use client'

import { Button } from './Button'
import { trackWhatsAppClick } from '@/lib/analytics'
import { useSiteSettings } from '@/components/SiteSettingsContext'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'

type WhatsAppCTAProps = {
  phone?: string
  message?: string
  label?: string
  location?: string
  variant?: 'primary' | 'cta'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function WhatsAppCTA({
  phone,
  message,
  label,
  location = 'cta',
  variant = 'cta',
  size = 'md',
  className = '',
}: WhatsAppCTAProps) {
  const s = useSiteSettings()
  const resolvedPhone = phone ?? s?.whatsapp ?? '+972527221111'
  const resolvedLabel = label ?? s?.ctaWhatsAppLabel ?? 'שלחו לנו WhatsApp'
  const resolvedMessage = message ?? s?.ctaWhatsAppMessage ?? ''
  const cleanPhone = resolvedPhone.replace(/[^+\d]/g, '')
  const url = `https://wa.me/${cleanPhone.replace('+', '')}${resolvedMessage ? `?text=${encodeURIComponent(resolvedMessage)}` : ''}`

  return (
    <Button
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      variant={variant}
      size={size}
      className={className}
      onClick={() => trackWhatsAppClick(location)}
    >
      <WhatsAppIcon className="h-5 w-5 shrink-0" />
      {resolvedLabel}
    </Button>
  )
}
