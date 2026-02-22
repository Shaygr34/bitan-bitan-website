import type { ReactNode } from 'react'
import { Info, AlertTriangle } from 'lucide-react'

type Variant = 'info' | 'warning'

type CalloutBoxProps = {
  variant?: Variant
  title?: string
  children: ReactNode
  className?: string
}

const variantStyles: Record<Variant, { bg: string; border: string; icon: string }> = {
  info: {
    bg: 'bg-callout',
    border: 'border-border',
    icon: 'text-primary',
  },
  warning: {
    bg: 'bg-gold/10',
    border: 'border-gold',
    icon: 'text-gold-hover',
  },
}

const variantIcons: Record<Variant, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
}

export function CalloutBox({
  variant = 'info',
  title,
  children,
  className = '',
}: CalloutBoxProps) {
  const styles = variantStyles[variant]
  const Icon = variantIcons[variant]

  return (
    <div
      className={[
        'rounded-lg border-s-4 p-space-4',
        styles.bg,
        styles.border,
        className,
      ].join(' ')}
    >
      <div className="flex gap-3">
        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${styles.icon}`} />
        <div className="min-w-0">
          {title && (
            <p className="font-bold text-primary mb-1">{title}</p>
          )}
          <div className="text-body text-text-secondary leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
