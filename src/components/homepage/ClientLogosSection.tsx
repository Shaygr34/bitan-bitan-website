'use client'

/**
 * Client Logos Marquee — CMS-driven infinite scroll.
 *
 * Data comes from Sanity (clientLogo documents) via props.
 * Falls back to hardcoded list if no CMS data exists.
 * JS-driven rAF animation, RTL-safe.
 */

import { useEffect, useRef } from 'react'
import { urlFor } from '@/sanity/image'
import type { ClientLogo } from '@/sanity/types'

/* ─── Internal entry type (normalized from CMS or fallback) ─── */

type LogoEntry =
  | { type: 'image'; src: string; alt: string; large?: boolean; small?: boolean }
  | { type: 'text'; name: string; subtitle: string }

/* ─── Hardcoded fallback (used when no CMS logos exist) ─── */

const FALLBACK_ROW_1: LogoEntry[] = [
  { type: 'image', src: '/logos/beit-hanna.svg', alt: 'בית חנה' },
  { type: 'image', src: '/logos/sela.svg', alt: 'א.י.ל. סלע' },
  { type: 'image', src: '/logos/climax.png', alt: 'קליימקס נדל"ן' },
  { type: 'image', src: '/logos/citizen.svg', alt: 'Citizen Cafe TLV' },
  { type: 'image', src: '/logos/schlein.png', alt: 'קבוצת שליין' },
  { type: 'text', name: 'אורן שאיבת בטון', subtitle: 'בע"מ' },
  { type: 'image', src: '/logos/zamsh.svg', alt: 'ZAMSH', small: true },
  { type: 'text', name: 'סופר קליק', subtitle: 'רשת סופרמרקטים' },
  { type: 'image', src: '/logos/hemilton.png', alt: 'המילטון' },
  { type: 'text', name: 'סינגל טקסטיל', subtitle: 'בע"מ' },
  { type: 'image', src: '/logos/mozart.png', alt: 'מוצארט', large: true },
]

const FALLBACK_ROW_2: LogoEntry[] = [
  { type: 'text', name: 'Knil', subtitle: 'Technology' },
  { type: 'text', name: 'ברק אור', subtitle: 'שירותי רכב' },
  { type: 'text', name: 'גרין אלמה', subtitle: 'חברה לבנייה' },
  { type: 'text', name: 'אלקטרו סיטי', subtitle: 'חשמל ואלקטרוניקה' },
  { type: 'image', src: '/logos/alchemist-new.png', alt: 'The Alchemist TLV' },
  { type: 'text', name: 'צלר תעופה', subtitle: 'שירותי תעופה' },
  { type: 'text', name: 'ווימברג', subtitle: 'יבוא ושיווק' },
  { type: 'text', name: 'הפשפש', subtitle: 'חנות חיות חברתית' },
  { type: 'text', name: 'ESP 710', subtitle: 'טכנולוגיה' },
  { type: 'image', src: '/logos/tapuz.png', alt: 'TAPUZ' },
]

/* ─── Convert CMS data to internal format ─── */

function cmsToEntries(logos: ClientLogo[]): LogoEntry[] {
  return logos.map((logo) => {
    const src = logo.logo ? urlFor(logo.logo, 300) : null
    if (src) {
      return {
        type: 'image' as const,
        src,
        alt: logo.companyName,
        large: logo.logoSize === 'large',
        small: logo.logoSize === 'small',
      }
    }
    return {
      type: 'text' as const,
      name: logo.companyName,
      subtitle: logo.subtitle || '',
    }
  })
}

const COPIES = 3

/* ─── Slot component ─── */

const SLOT_BASE = 'flex-shrink-0 opacity-40 transition-all duration-500 ease-out cursor-default select-none'

function Slot({ entry }: { entry: LogoEntry }) {
  if (entry.type === 'image') {
    return (
      <div className={`${SLOT_BASE} flex items-center`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.src}
          alt={entry.alt}
          draggable={false}
          style={{ filter: 'brightness(0) invert(1)' }}
          className={
            entry.large
              ? 'h-10 md:h-14 w-auto max-w-[130px] md:max-w-[190px] object-contain pointer-events-none'
              : entry.small
              ? 'h-5 md:h-7 w-auto max-w-[80px] md:max-w-[120px] object-contain pointer-events-none'
              : 'h-7 md:h-10 w-auto max-w-[100px] md:max-w-[150px] object-contain pointer-events-none'
          }
        />
      </div>
    )
  }
  return (
    <div className={`${SLOT_BASE} text-center leading-tight min-w-[70px] md:min-w-[100px]`}>
      <span className="block text-white font-medium text-[0.75rem] md:text-[0.9rem] whitespace-nowrap">{entry.name}</span>
      <span className="block text-white/30 font-light text-[0.55rem] md:text-[0.65rem] whitespace-nowrap">{entry.subtitle}</span>
    </div>
  )
}

/* ─── Infinite row with rAF animation ─── */

function InfiniteRow({ items, speed, reverse = false }: { items: LogoEntry[]; speed: number; reverse?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)

  const setItems = reverse ? [...items].reverse() : items

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let offset = 0
    let setWidth = 0
    let rafId = 0
    let active = true

    function measure() {
      if (!track || !active) return
      const gap = parseFloat(getComputedStyle(track).columnGap) || 48
      const totalWidth = track.scrollWidth + gap
      if (totalWidth > gap) {
        setWidth = totalWidth / COPIES
      }
    }

    function tick() {
      if (!active) return

      if (setWidth <= 0) {
        measure()
        if (setWidth <= 0) {
          rafId = requestAnimationFrame(tick)
          return
        }
      }

      offset += speed
      const wrappedOffset = offset % setWidth

      track!.style.transform = `translate3d(${wrappedOffset}px,0,0)`
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      active = false
      cancelAnimationFrame(rafId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const repeated = [...setItems, ...setItems, ...setItems]

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className="marquee-track flex items-center will-change-transform gap-12 md:gap-24"
      >
        {repeated.map((entry, i) => (
          <Slot key={i} entry={entry} />
        ))}
      </div>
    </div>
  )
}

/* ─── Main section (accepts CMS data via props) ─── */

type Props = {
  logos?: ClientLogo[]
}

export function ClientLogosSection({ logos }: Props) {
  // Convert CMS data or use fallback
  let row1: LogoEntry[]
  let row2: LogoEntry[]

  if (logos && logos.length > 0) {
    const r1 = logos.filter((l) => l.row === 1)
    const r2 = logos.filter((l) => l.row === 2)
    row1 = r1.length > 0 ? cmsToEntries(r1) : FALLBACK_ROW_1
    row2 = r2.length > 0 ? cmsToEntries(r2) : FALLBACK_ROW_2
  } else {
    row1 = FALLBACK_ROW_1
    row2 = FALLBACK_ROW_2
  }

  return (
    <section className="bg-primary py-6 md:py-10 overflow-hidden">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-body-lg md:text-h3 font-bold text-white">לקוחות שבחרו בנו</h2>
        <div className="w-10 h-[3px] bg-gold mx-auto mt-2 rounded-full" />
      </div>

      <div className="flex flex-col gap-3 md:gap-4">
        <InfiniteRow items={row1} speed={0.3} />
        <InfiniteRow items={row2} speed={0.25} reverse />
      </div>

      <style>{`
        .marquee-track:hover > * { opacity: 0.25 !important; transition: opacity 0.5s ease, transform 0.5s ease; }
        .marquee-track:hover > *:hover { opacity: 0.85 !important; transform: scale(1.03); }
      `}</style>
    </section>
  )
}
