/**
 * Client Logos Conveyor Belt — hardcoded from curated list.
 * True infinite marquee: 2 identical sets, translateX(-50%), seamless loop.
 * All image logos are white-on-transparent (no CSS filter).
 *
 * Mobile: tighter gap (1.5rem), smaller images, faster animation.
 * Desktop: generous gap (3rem), full-size images, relaxed speed.
 */

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

/* gap value used in both the flex gap AND margin-inline-end for seamless seam */
const GAP = 'gap-6 md:gap-12'
const MARGIN = 'me-6 md:me-12'

function Slot({ entry }: { entry: LogoEntry }) {
  if (entry.type === 'image') {
    return (
      <div className="flex-shrink-0 flex items-center justify-center h-10 md:h-[52px]">
        <img
          src={entry.src}
          alt={entry.alt}
          className={[
            'w-auto object-contain',
            entry.large
              ? 'h-10 md:h-[64px] max-w-[120px] md:max-w-[200px]'
              : 'h-8 md:h-[44px] max-w-[100px] md:max-w-[160px]',
          ].join(' ')}
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 flex items-center justify-center h-10 md:h-[52px] text-center leading-tight">
      <div>
        <span className="block text-white font-medium text-caption md:text-body-sm whitespace-nowrap">{entry.name}</span>
        <span className="block text-white/30 font-light text-[0.6rem] md:text-caption whitespace-nowrap">{entry.subtitle}</span>
      </div>
    </div>
  )
}

function MarqueeSet({ items }: { items: LogoEntry[] }) {
  return (
    <div className={`inline-flex items-center ${GAP} ${MARGIN} flex-shrink-0`}>
      {items.map((entry, i) => (
        <Slot key={i} entry={entry} />
      ))}
    </div>
  )
}

function MarqueeRow({ items, direction }: { items: LogoEntry[]; direction: 'left' | 'right' }) {
  const animClass = direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'

  return (
    <div className="overflow-hidden py-1">
      <div className={`flex w-max will-change-transform hover:[animation-play-state:paused] ${animClass}`}>
        <MarqueeSet items={items} />
        <MarqueeSet items={items} />
      </div>
    </div>
  )
}

export function ClientLogosSection() {
  return (
    <section className="bg-primary py-space-7 md:py-space-9 overflow-hidden relative">
      {/* Edge fade — narrower on mobile */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 md:w-[100px] z-10 bg-gradient-to-l from-primary to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 md:w-[100px] z-10 bg-gradient-to-r from-primary to-transparent" />

      <div className="text-center mb-space-5 md:mb-space-7">
        <h2 className="text-body-lg md:text-h3 font-bold text-white">לקוחות שבחרו בנו</h2>
        <div className="w-[40px] md:w-[50px] h-[3px] bg-gold mx-auto mt-space-2 rounded-full" />
      </div>

      <div className="flex flex-col gap-2 md:gap-space-4">
        <MarqueeRow items={ROW_1} direction="left" />
        <MarqueeRow items={ROW_2} direction="right" />
      </div>
    </section>
  )
}
