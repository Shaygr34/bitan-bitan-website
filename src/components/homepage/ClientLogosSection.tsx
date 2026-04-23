'use client'

import { useEffect, useRef } from 'react'

type LogoEntry =
  | { type: 'image'; src: string; alt: string; large?: boolean; small?: boolean }
  | { type: 'text'; name: string; subtitle: string }

const ROW_1: LogoEntry[] = [
  { type: 'text', name: 'בית חנה', subtitle: 'המקום השלישי' },
  { type: 'text', name: 'א.י.ל. סלע', subtitle: 'בנייה ותשתית' },
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

const GAP_MOBILE = 48
const GAP_DESKTOP = 80
const COPIES = 3

/*
 * Slot hover effect:
 * - Default: opacity 0.4 (dimmed)
 * - When ANY slot in the row is hovered (group-hover on track):
 *   all slots dim to 0.2, the HOVERED slot pops to 1.0 + scale
 * - Transition is smooth (300ms)
 * - Cursor pointer, no text selection
 */
const SLOT_BASE = 'flex-shrink-0 opacity-40 transition-all duration-300 ease-out hover:!opacity-100 hover:scale-110 cursor-default select-none'

function Slot({ entry }: { entry: LogoEntry }) {
  if (entry.type === 'image') {
    return (
      <div className={`${SLOT_BASE} flex items-center`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.src}
          alt={entry.alt}
          draggable={false}
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

function InfiniteRow({ items, speed, reverse = false }: { items: LogoEntry[]; speed: number; reverse?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null)

  // Reverse row: reverse item order (scroll direction stays the same mechanically)
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
      // Get actual gap from computed style
      const gap = parseFloat(getComputedStyle(track).columnGap) || GAP_MOBILE
      const totalWidth = track.scrollWidth + gap
      if (totalWidth > gap) {
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
        // Both directions start at offset 0
      }

      // Both directions use positive offset increment.
      // Row 1: positive translateX = items scroll left (RTL natural)
      // Row 2 (reverse): negative translateX = items scroll right
      // But BOTH need copies entering from the same side, so both
      // use the same positive offset, just applied with opposite sign.
      offset += speed

      // Modulo wraps within one set width
      const wrappedOffset = offset % setWidth

      // Both rows use positive translateX (items move LEFT in RTL).
      // Row 2 reverses the ITEM ORDER in the DOM instead of the scroll direction.
      // This way both rows scroll the same direction mechanically but show
      // different content order, creating the visual impression of opposite flow.
      const visualOffset = wrappedOffset

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

  // 3 copies for seamless loop
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

export function ClientLogosSection() {
  return (
    <section className="bg-primary py-6 md:py-10 overflow-hidden">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-body-lg md:text-h3 font-bold text-white">לקוחות שבחרו בנו</h2>
        <div className="w-10 h-[3px] bg-gold mx-auto mt-2 rounded-full" />
      </div>

      <div className="flex flex-col gap-3 md:gap-4">
        <InfiniteRow items={ROW_1} speed={0.3} />
        <InfiniteRow items={ROW_2} speed={0.25} reverse />
      </div>

      {/* Group-hover: when track is hovered, dim all children except the hovered one */}
      <style>{`
        .marquee-track:hover > * { opacity: 0.15 !important; transition: opacity 0.3s ease, transform 0.3s ease; }
        .marquee-track:hover > *:hover { opacity: 1 !important; transform: scale(1.12); }
      `}</style>
    </section>
  )
}
