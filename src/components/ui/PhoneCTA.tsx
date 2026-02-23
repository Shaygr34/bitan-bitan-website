'use client'

import { Phone } from 'lucide-react'
import { Button } from './Button'
import { LTR } from './LTR'
import { trackPhoneClick } from '@/lib/analytics'

type PhoneCTAProps = {
  phone?: string
  label?: string
  location?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PhoneCTA({
  phone = '03-5174295',
  label,
  location = 'cta',
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
      onClick={() => trackPhoneClick(location)}
    >
      {label ?? <LTR>{phone}</LTR>}
    </Button>
  )
}
