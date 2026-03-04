import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  hover?: boolean
  id?: string
}

export function Card({ children, className = '', hover = true, id }: CardProps) {
  return (
    <div
      id={id}
      className={[
        'bg-white rounded-xl border border-border p-space-5 shadow-sm',
        hover &&
          'transition-all duration-base hover:shadow-lg hover:-translate-y-1 hover:border-gold/30',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}

type CardHeaderProps = {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-space-3 ${className}`}>
      {children}
    </div>
  )
}

type CardBodyProps = {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={className}>{children}</div>
}

type CardFooterProps = {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-space-4 pt-space-3 border-t border-border-light ${className}`}>
      {children}
    </div>
  )
}
