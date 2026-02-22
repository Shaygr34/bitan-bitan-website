import type { ReactNode } from 'react'

type LTRProps = {
  children: ReactNode
  className?: string
  as?: 'span' | 'div'
}

/**
 * Wraps content that should render left-to-right inside the RTL page.
 * Use for phone numbers, email addresses, URLs, code snippets, etc.
 */
export function LTR({ children, className = '', as: Tag = 'span' }: LTRProps) {
  return (
    <Tag dir="ltr" className={`inline-block ${className}`}>
      {children}
    </Tag>
  )
}
