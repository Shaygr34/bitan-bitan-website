import type { ReactNode } from 'react'

type TagPillProps = {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}

export function TagPill({
  children,
  active = false,
  onClick,
  className = '',
}: TagPillProps) {
  const Component = onClick ? 'button' : 'span'

  return (
    <Component
      onClick={onClick}
      className={[
        'inline-flex items-center px-3 py-1 rounded-pill text-body-sm font-medium transition-all duration-fast',
        active
          ? 'bg-primary text-white'
          : 'bg-surface text-text-secondary hover:bg-callout',
        onClick && 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Component>
  )
}
