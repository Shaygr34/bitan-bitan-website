/**
 * Motion configuration and shared variants.
 * Uses the `motion` package (formerly framer-motion).
 *
 * Timing guidelines:
 * - Micro-interactions: 150–200ms
 * - Section reveals: 500–700ms
 * - Stagger between items: 80–120ms
 * - Page transitions: 300–400ms
 */

import type { Variants, Transition } from 'motion/react'

/* ─── Shared easing curves ─── */
export const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const

/* ─── Default transition for reveals ─── */
export const REVEAL_TRANSITION: Transition = {
  duration: 0.6,
  ease: EASE_OUT_QUART as unknown as number[],
}

/* ─── Section / element reveal variants ─── */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: REVEAL_TRANSITION,
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: EASE_OUT_QUART as unknown as number[] },
  },
}

/* ─── Stagger container ─── */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

/* ─── Gold underline grow ─── */
export const underlineGrow: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.6, ease: EASE_OUT_QUART as unknown as number[], delay: 0.2 },
  },
}

/* ─── Counter / stat number ─── */
export const statPop: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT_QUART as unknown as number[] },
  },
}
