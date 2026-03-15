'use client'

import { useState, useEffect, useRef } from 'react'
import { useInView } from '@/hooks/useInView'

type Props = {
  /** Target number to animate to */
  target: number
  /** Suffix to append after animation (e.g. "+") */
  suffix?: string
  /** Prefix to prepend (e.g. "₪") */
  prefix?: string
  /** Animation duration in ms. Default 2000 */
  duration?: number
  /** Additional class names */
  className?: string
}

/**
 * Animates a number from 0 to target when scrolled into view.
 * Uses ease-out curve, triggers once.
 */
export function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 2000,
  className = '',
}: Props) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.3 })
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!inView || hasAnimated.current) return
    hasAnimated.current = true

    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  )
}
