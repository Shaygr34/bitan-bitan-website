'use client'

/**
 * Client Logos Marquee — JS-driven infinite scroll, zero dead space.
 *
 * How it works:
 * - Items rendered 4× to guarantee continuous coverage on any screen
 * - Track is one flat flex row with uniform gap
 * - rAF measures ONE set (N items × width + N × gap) from DOM
 * - Offset resets by exactly one set width → seamless closed loop
 * - No CSS animation, no percentage guesswork
 */

import { useEffect, useRef, useCallback } from 'react'

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

const GAP = 40 // px between items

function Slot({ entry }: { entry: LogoEntry }) {
  if (entry.type === 'image') {
    return (
      <div className="flex-shrink-0 flex items-center justify-center">
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

/**
 * Measure one "set" width = sum of the first N items' widths + (N) gaps.
 * We include one trailing gap because that's the spacing before the next
 * copy's first item — this makes the reset seamless.
 */
function measureSetWidth(track: HTMLElement, itemCount: number): number {
  const children = track.children
  if (children.length === 0) return 0
  const firstItem = children[0] as HTMLElement
  const lastItemOfSet = children[itemCount - 1] as HTMLElement
  // Distance from start of first item to start of (itemCount)th item
  // = one full set including trailing gap
  const nextSetStart = children[itemCount] as HTMLElement
  if (nextSetStart) {
    return nextSetStart.offsetLeft - firstItem.offsetLeft
  }
  // Fallback: measure manually
  return lastItemOfSet.offsetLeft + lastItemOfSet.offsetWidth - firstItem.offsetLeft + GAP
}

function InfiniteRow({
  items,
  speed,
  reverse = false,
}: {
  items: LogoEntry[]
  speed: number
  reverse?: boolean
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const setWidthRef = useRef(0)
  const readyRef = useRef(false)

  const startAnimation = useCallback(() => {
    const track = trackRef.current
    if (!track || readyRef.current) return

    setWidthRef.current = measureSetWidth(track, items.length)
    if (setWidthRef.current <= 0) return

    readyRef.current = true

    // For reverse: start offset at -setWidth so it scrolls the other way
    if (reverse) {
      offsetRef.current = -setWidthRef.current
    }

    let rafId: number

    function tick() {
      const sw = setWidthRef.current
      if (reverse) {
        offsetRef.current += speed
        if (offsetRef.current >= 0) offsetRef.current -= sw
      } else {
        offsetRef.current -= speed
        if (offsetRef.current <= -sw) offsetRef.current += sw
      }
      track!.style.transform = `translate3d(${offsetRef.current}px,0,0)`
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [items.length, speed, reverse])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    // Wait for all images to load before measuring
    const images = track.querySelectorAll('img')
    let loaded = 0
    const total = images.length

    if (total === 0) {
      const cleanup = startAnimation()
      return cleanup
    }

    const onLoad = () => {
      loaded++
      if (loaded >= total) {
        const cleanup = startAnimation()
        // Store cleanup for unmount
        if (cleanup) cleanupRef.current = cleanup
      }
    }

    const cleanupRef = { current: () => {} }

    images.forEach((img) => {
      if (img.complete) {
        onLoad()
      } else {
        img.addEventListener('load', onLoad, { once: true })
        img.addEventListener('error', onLoad, { once: true })
      }
    })

    return () => {
      cleanupRef.current()
      readyRef.current = false
    }
  }, [startAnimation])

  // 4 copies: guarantees continuous coverage on any viewport.
  // On mobile (375px), one set is ~1200px → 4× = 4800px.
  // On desktop (1440px), one set is ~1800px → 4× = 7200px.
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
