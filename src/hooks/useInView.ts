'use client'

import { useRef, useState, useEffect } from 'react'

type UseInViewOptions = {
  /** Fraction of element visible before triggering (0–1). Default 0.1 */
  threshold?: number
  /** Fire only once. Default true */
  triggerOnce?: boolean
  /** Root margin string. Default '0px' */
  rootMargin?: string
}

/**
 * Lightweight IntersectionObserver hook.
 * Returns a ref to attach and a boolean `inView`.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  triggerOnce = true,
  rootMargin = '0px',
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (triggerOnce) observer.unobserve(el)
        } else if (!triggerOnce) {
          setInView(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, triggerOnce, rootMargin])

  return { ref, inView }
}
