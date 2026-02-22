'use client'

import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react'
import { type LucideIcon } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'cta'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-light active:bg-primary focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary',
  secondary:
    'bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white active:bg-primary-light focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-primary hover:bg-surface active:bg-callout focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  cta:
    'bg-gold text-primary font-bold hover:bg-gold-hover active:bg-gold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gold',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-body-sm rounded-md',
  md: 'px-6 py-3 text-body rounded-lg',
  lg: 'px-8 py-4 text-body-lg rounded-lg',
}

type BaseProps = {
  variant?: Variant
  size?: Size
  icon?: LucideIcon
  iconPosition?: 'start' | 'end'
}

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never
  }

type ButtonAsLink = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

type ButtonProps = ButtonAsButton | ButtonAsLink

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(props, ref) {
  const {
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'start',
    className = '',
    children,
    ...rest
  } = props

  const classes = [
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-base cursor-pointer',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {Icon && iconPosition === 'start' && <Icon className="h-5 w-5 shrink-0" />}
      {children}
      {Icon && iconPosition === 'end' && <Icon className="h-5 w-5 shrink-0" />}
    </>
  )

  if ('href' in rest && rest.href) {
    const { href, ...anchorProps } = rest as ButtonAsLink
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={classes}
        {...anchorProps}
      >
        {content}
      </a>
    )
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      {...buttonProps}
    >
      {content}
    </button>
  )
})
