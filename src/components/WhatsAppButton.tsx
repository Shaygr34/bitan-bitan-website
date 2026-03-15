'use client'

import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { trackWhatsAppClick } from '@/lib/analytics'

/**
 * Floating WhatsApp button — fixed bottom-left (natural for RTL).
 * Pulse glow animation, visible on all pages and viewports.
 */
export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/972527221111"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsAppClick('floating_button')}
      aria-label="שלחו הודעה בוואטסאפ"
      className="fixed bottom-20 md:bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-110 whatsapp-pulse"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}
