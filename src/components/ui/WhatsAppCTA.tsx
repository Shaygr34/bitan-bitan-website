'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from './Button'

type WhatsAppCTAProps = {
  phone?: string
  message?: string
  label?: string
  variant?: 'primary' | 'cta'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function trackWhatsAppClick() {
  // gtag event stub — will be wired to Google Analytics in a later milestone
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const g = (window as Record<string, unknown>).gtag as
      | ((...args: unknown[]) => void)
      | undefined
    g?.('event', 'whatsapp_click', {
      event_category: 'contact',
      event_label: 'whatsapp_cta',
    })
  }
}

export function WhatsAppCTA({
  phone = '+972527221111',
  message = '',
  label = 'שלחו לנו WhatsApp',
  variant = 'cta',
  size = 'md',
  className = '',
}: WhatsAppCTAProps) {
  const cleanPhone = phone.replace(/[^+\d]/g, '')
  const url = `https://wa.me/${cleanPhone.replace('+', '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`

  return (
    <Button
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      variant={variant}
      size={size}
      icon={MessageCircle}
      iconPosition="start"
      className={className}
      onClick={trackWhatsAppClick}
    >
      {label}
    </Button>
  )
}
