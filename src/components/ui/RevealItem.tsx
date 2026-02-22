'use client'

import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import { fadeUp } from '@/lib/motion'
import type { Variants } from 'motion/react'

type RevealItemProps = {
  children: ReactNode
  className?: string
  variants?: Variants
}

/**
 * An individual item inside a RevealGroup.
 * Inherits stagger timing from the parent RevealGroup.
 */
export function RevealItem({
  children,
  className = '',
  variants = fadeUp,
}: RevealItemProps) {
  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  )
}
