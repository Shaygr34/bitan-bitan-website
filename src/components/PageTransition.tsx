'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'

/**
 * Global page entrance animation.
 * Uses pathname as React key — when route changes, the div remounts,
 * which restarts the CSS animation. No external deps needed.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  )
}
