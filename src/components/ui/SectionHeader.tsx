import type { ReactNode } from 'react'

type SectionHeaderProps = {
  children: ReactNode
  subtitle?: string
  centered?: boolean
  className?: string
}

export function SectionHeader({
  children,
  subtitle,
  centered = false,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={[centered && 'text-center', className].filter(Boolean).join(' ')}>
      <h2 className="text-h2 font-bold text-primary">{children}</h2>
      <span
        className={[
          'gold-underline mt-3',
          centered && 'mx-auto',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      {subtitle && (
        <p className="mt-space-4 text-body-lg text-text-secondary max-w-narrow">
          {subtitle}
        </p>
      )}
    </div>
  )
}
