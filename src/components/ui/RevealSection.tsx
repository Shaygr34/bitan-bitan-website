'use client'

import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import { fadeUp } from '@/lib/motion'
import type { Variants } from 'motion/react'

type RevealSectionProps = {
  children: ReactNode
  className?: string
  variants?: Variants
}

/**
 * Wraps a full-width section with a fade-up reveal on scroll.
 * Uses `whileInView` with `once: true` so animation fires only the first time.
 */
export function RevealSection({
  children,
  className = '',
  variants = fadeUp,
}: RevealSectionProps) {
  return (
    <motion.section
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.section>
  )
}
