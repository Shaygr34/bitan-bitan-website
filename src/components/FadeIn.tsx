'use client'

import { type ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'

type Props = {
  children: ReactNode
  className?: string
  /** Delay in ms (useful for staggering siblings). Default 0 */
  delay?: number
}

/**
 * Lightweight scroll-triggered fade-in wrapper.
 * Uses IntersectionObserver (no external deps).
 * For most sections, prefer the existing RevealSection/RevealGroup system.
 */
export function FadeIn({ children, className = '', delay = 0 }: Props) {
  const { ref, inView } = useInView({ threshold: 0.1 })

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 600ms ease-out ${delay}ms, transform 600ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
