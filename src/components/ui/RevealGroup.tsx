'use client'

import { type ReactNode } from 'react'
import { motion } from 'motion/react'
import { staggerContainer } from '@/lib/motion'
import type { Variants } from 'motion/react'

type RevealGroupProps = {
  children: ReactNode
  className?: string
  variants?: Variants
}

/**
 * A stagger container that reveals children sequentially.
 * Wrap RevealItem children inside this component.
 */
export function RevealGroup({
  children,
  className = '',
  variants = staggerContainer,
}: RevealGroupProps) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
