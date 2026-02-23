'use client'

import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { EASE_OUT_QUART } from '@/lib/motion'
import { trackFAQExpand } from '@/lib/analytics'

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

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => {
          if (!isOpen) trackFAQExpand(title)
          setIsOpen(!isOpen)
        }}
        className="w-full flex items-center justify-between py-space-4 text-start text-body-lg font-medium text-primary hover:text-primary-light transition-colors duration-fast cursor-pointer"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT_QUART }}
        >
          <ChevronDown className="h-5 w-5 shrink-0 ms-3 text-text-muted" />
        </motion.span>
      </button>
      <AnimatePresence initial={defaultOpen}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_QUART }}
            className="overflow-hidden"
          >
            <div className="pb-space-4 text-text-secondary leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
