'use client'

import { useEffect, useRef } from 'react'

type LogoEntry =
  | { type: 'image'; src: string; alt: string; large?: boolean }
  | { type: 'text'; name: string; subtitle: string }

const ROW_1: LogoEntry[] = [
  { type: 'text', name: 'בית חנה', subtitle: 'המקום השלישי' },
  { type: 'text', name: 'א.י.ל. סלע', subtitle: 'בנייה ותשתית' },
  { type: 'image', src: '/logos/climax.png', alt: 'קליימקס נדל"ן' },
  { type: 'image', src: '/logos/citizen.svg', alt: 'Citizen Cafe TLV' },
  { type: 'image', src: '/logos/schlein.png', alt: 'קבוצת שליין' },
  { type: 'text', name: 'אורן שאיבת בטון', subtitle: 'בע"מ' },
  { type: 'image', src: '/logos/zamsh.svg', alt: 'ZAMSH' },
  { type: 'text', name: 'סופר קליק', subtitle: 'רשת סופרמרקטים' },
  { type: 'image', src: '/logos/hemilton.png', alt: 'המילטון' },
  { type: 'text', name: 'סינגל טקסטיל', subtitle: 'בע"מ' },
  { type: 'image', src: '/logos/mozart.png', alt: 'מוצארט', large: true },
]

const ROW_2: LogoEntry[] = [
  { type: 'text', name: 'Knil', subtitle: 'Technology' },
  { type: 'text', name: 'ברק אור', subtitle: 'שירותי רכב' },
  { type: 'text', name: 'גרין אלמה', subtitle: 'חברה לבנייה' },
  { type: 'text', name: 'אלקטרו סיטי', subtitle: 'חשמל ואלקטרוניקה' },
  { type: 'text', name: 'The Alchemist', subtitle: 'TLV' },
  { type: 'text', name: 'צלר תעופה', subtitle: 'שירותי תעופה' },
  { type: 'text', name: 'ווימברג', subtitle: 'יבוא ושיווק' },
  { type: 'text', name: 'הפשפש', subtitle: 'חנות חיות חברתית' },
  { type: 'text', name: 'ESP 710', subtitle: 'טכנולוגיה' },
  { type: 'text', name: 'TAPUZ', subtitle: 'שירותי אריזה ומשלוח' },
]

const GAP = 40
const COPIES = 4 // Number of times items are duplicated in the track

function Slot({ entry }: { entry: LogoEntry }) {
  if (entry.type === 'image') {
    return (
      <div className="flex-shrink-0 flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.src}
          alt={entry.alt}
          className={
            entry.large
              ? 'h-8 md:h-12 w-auto max-w-[110px] md:max-w-[170px] object-contain'
              : 'h-6 md:h-9 w-auto max-w-[90px] md:max-w-[140px] object-contain'
          }
        />
      </div>
    )
  }
  return (
    <div className="flex-shrink-0 text-center leading-tight">
      <span className="block text-white font-medium text-[0.7rem] md:text-[0.85rem] whitespace-nowrap">{entry.name}</span>
      <span className="block text-white/30 font-light text-[0.55rem] md:text-[0.65rem] whitespace-nowrap">{entry.subtitle}</span>
    </div>
  )
}

function InfiniteRow({ items, speed, reverse = false }: { items: LogoEntry[]; speed: number; reverse?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let offset = 0
    let setWidth = 0
    let rafId = 0
    let active = true

    function measure() {
      if (!track || !active) return
      // scrollWidth includes (totalItems - 1) gaps. We need (totalItems) gaps
      // for perfect per-copy measurement (each copy needs a trailing gap).
      // Add one gap to make it evenly divisible by COPIES.
      const totalWidth = track.scrollWidth + GAP
      if (totalWidth > GAP) {
        setWidth = totalWidth / COPIES
      }
    }

    function tick() {
      if (!active) return

      // Re-measure if not yet measured (images may have loaded)
      if (setWidth <= 0) {
        measure()
        if (setWidth <= 0) {
          rafId = requestAnimationFrame(tick)
          return
        }
        // Initialize offset for reverse direction
        if (reverse) offset = 0
      }

      // Accumulate offset continuously (never "reset" — avoids blip)
      if (reverse) {
        offset -= speed
      } else {
        offset += speed
      }

      // Use modulo to keep the visual offset within one set width
      // This creates a perfect loop without any discrete jump
      let visualOffset = offset % setWidth
      if (reverse && visualOffset > 0) visualOffset -= setWidth
      if (!reverse && visualOffset < 0) visualOffset += setWidth

      track!.style.transform = `translate3d(${visualOffset}px,0,0)`
      rafId = requestAnimationFrame(tick)
    }

    // Start immediately
    rafId = requestAnimationFrame(tick)

    return () => {
      active = false
      cancelAnimationFrame(rafId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const repeated = [...items, ...items, ...items, ...items]

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className="flex items-center will-change-transform"
        style={{ gap: `${GAP}px` }}
      >
        {repeated.map((entry, i) => (
          <Slot key={i} entry={entry} />
        ))}
      </div>
    </div>
  )
}

export function ClientLogosSection() {
  return (
    <section className="bg-primary py-6 md:py-10 overflow-hidden">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-body-lg md:text-h3 font-bold text-white">לקוחות שבחרו בנו</h2>
        <div className="w-10 h-[3px] bg-gold mx-auto mt-2 rounded-full" />
      </div>

      <div className="flex flex-col gap-3 md:gap-4">
        <InfiniteRow items={ROW_1} speed={0.4} />
        <InfiniteRow items={ROW_2} speed={0.35} reverse />
      </div>
    </section>
  )
}
