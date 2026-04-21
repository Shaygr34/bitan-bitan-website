'use client'

/**
 * Client Logos Marquee — JS-driven infinite scroll.
 *
 * Why JS instead of CSS animation:
 * CSS translateX(-50%) / calc(-100% - gap) never matches the actual
 * rendered width precisely — causing dead space, pops, and glitches.
 *
 * This approach:
 * 1. Renders items in a single row, duplicated enough to overflow 2× viewport
 * 2. Uses requestAnimationFrame to smoothly translate the track
 * 3. When the first set scrolls fully off-screen, resets position by
 *    exactly one set width — creating a perfect closed loop
 * 4. Measures actual DOM widths — zero guesswork
 */

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

const GAP = 32 // px gap between items
const SPEED = 0.5 // px per frame (~30px/sec at 60fps)

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

function InfiniteMarquee({ items, speed = SPEED }: { items: LogoEntry[]; speed?: number }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const setWidthRef = useRef(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    // Wait for images to load before measuring
    const images = track.querySelectorAll('img')
    const imageLoadPromises = Array.from(images).map(
      (img) => img.complete ? Promise.resolve() : new Promise<void>((r) => { img.onload = () => r(); img.onerror = () => r() })
    )

    let rafId: number
    let running = true

    Promise.all(imageLoadPromises).then(() => {
      if (!running) return

      // Measure one set width: total track width / 3 (we render 3 copies)
      const totalWidth = track.scrollWidth
      setWidthRef.current = totalWidth / 3

      function tick() {
        if (!running) return
        offsetRef.current -= speed
        // When we've scrolled past one full set, reset by adding one set width back
        if (Math.abs(offsetRef.current) >= setWidthRef.current) {
          offsetRef.current += setWidthRef.current
        }
        track!.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
        rafId = requestAnimationFrame(tick)
      }

      rafId = requestAnimationFrame(tick)
    })

    return () => {
      running = false
      cancelAnimationFrame(rafId)
    }
  }, [speed])

  // Render 3 copies to ensure the track is always wider than viewport
  // and there's always a "next" set sliding in from the edge
  const tripled = [...items, ...items, ...items]

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className="flex items-center will-change-transform"
        style={{ gap: `${GAP}px` }}
      >
        {tripled.map((entry, i) => (
          <Slot key={i} entry={entry} />
        ))}
      </div>
    </div>
  )
}

function InfiniteMarqueeReverse({ items, speed = SPEED }: { items: LogoEntry[]; speed?: number }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const setWidthRef = useRef(0)
  const initializedRef = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const images = track.querySelectorAll('img')
    const imageLoadPromises = Array.from(images).map(
      (img) => img.complete ? Promise.resolve() : new Promise<void>((r) => { img.onload = () => r(); img.onerror = () => r() })
    )

    let rafId: number
    let running = true

    Promise.all(imageLoadPromises).then(() => {
      if (!running) return

      const totalWidth = track.scrollWidth
      setWidthRef.current = totalWidth / 3

      // Start offset at -1 set width so we scroll in the opposite direction
      if (!initializedRef.current) {
        offsetRef.current = -setWidthRef.current
        initializedRef.current = true
      }

      function tick() {
        if (!running) return
        offsetRef.current += speed
        // When we've scrolled past zero, reset by subtracting one set width
        if (offsetRef.current >= 0) {
          offsetRef.current -= setWidthRef.current
        }
        track!.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
        rafId = requestAnimationFrame(tick)
      }

      rafId = requestAnimationFrame(tick)
    })

    return () => {
      running = false
      cancelAnimationFrame(rafId)
    }
  }, [speed])

  const tripled = [...items, ...items, ...items]

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className="flex items-center will-change-transform"
        style={{ gap: `${GAP}px` }}
      >
        {tripled.map((entry, i) => (
          <Slot key={i} entry={entry} />
        ))}
      </div>
    </div>
  )
}

export function ClientLogosSection() {
  return (
    <section className="bg-primary py-6 md:py-10 overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0, black 30px, black calc(100% - 30px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 30px, black calc(100% - 30px), transparent 100%)',
      }}
    >
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-body-lg md:text-h3 font-bold text-white">לקוחות שבחרו בנו</h2>
        <div className="w-10 h-[3px] bg-gold mx-auto mt-2 rounded-full" />
      </div>

      <div className="flex flex-col gap-3 md:gap-4">
        <InfiniteMarquee items={ROW_1} speed={0.4} />
        <InfiniteMarqueeReverse items={ROW_2} speed={0.35} />
      </div>
    </section>
  )
}
