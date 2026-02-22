'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

type AccordionItemProps = {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | undefined>(
    defaultOpen ? undefined : 0
  )

  useEffect(() => {
    if (!contentRef.current) return
    if (isOpen) {
      setHeight(contentRef.current.scrollHeight)
    } else {
      setHeight(0)
    }
  }, [isOpen])

  // After transition ends when opening, set height to auto for dynamic content
  const handleTransitionEnd = () => {
    if (isOpen) setHeight(undefined)
  }

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-space-4 text-start text-body-lg font-medium text-primary hover:text-primary-light transition-colors duration-fast cursor-pointer"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDown
          className={[
            'h-5 w-5 shrink-0 ms-3 text-text-muted transition-transform duration-base',
            isOpen && 'rotate-180',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </button>
      <div
        style={{ height: height !== undefined ? `${height}px` : 'auto' }}
        className="overflow-hidden transition-[height] duration-base ease-in-out"
        onTransitionEnd={handleTransitionEnd}
      >
        <div ref={contentRef} className="pb-space-4 text-text-secondary leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

type AccordionProps = {
  children: ReactNode
  className?: string
}

export function Accordion({ children, className = '' }: AccordionProps) {
  return (
    <div className={`border-t border-border ${className}`}>
      {children}
    </div>
  )
}
