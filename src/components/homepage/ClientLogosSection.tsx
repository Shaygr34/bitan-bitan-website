/**
 * Client Logos Conveyor Belt — hardcoded from curated list.
 * Uses true infinite marquee: 2 identical .marquee-set with
 * margin-inline-end = gap, translateX(-50%) for seamless loop.
 * All image logos are white-on-transparent (no CSS filter).
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

function Slot({ entry }: { entry: LogoEntry }) {
  if (entry.type === 'image') {
    return (
      <div className="flex-shrink-0 flex items-center justify-center h-[52px]">
        <img
          src={entry.src}
          alt={entry.alt}
          className={[
            'w-auto object-contain',
            entry.large ? 'h-[64px] max-w-[200px]' : 'h-[44px] max-w-[160px]',
          ].join(' ')}
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 flex items-center justify-center h-[52px] min-w-[80px] text-center leading-tight">
      <div>
        <span className="block text-white font-medium text-body-sm whitespace-nowrap">{entry.name}</span>
        <span className="block text-white/30 font-light text-caption whitespace-nowrap">{entry.subtitle}</span>
      </div>
    </div>
  )
}

function MarqueeSet({ items }: { items: LogoEntry[] }) {
  return (
    <div className="inline-flex items-center gap-[3rem] me-[3rem] flex-shrink-0">
      {items.map((entry, i) => (
        <Slot key={i} entry={entry} />
      ))}
    </div>
  )
}

function MarqueeRow({ items, direction }: { items: LogoEntry[]; direction: 'left' | 'right' }) {
  const animClass = direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'

  return (
    <div className="overflow-hidden py-2">
      <div className={`flex w-max will-change-transform hover:[animation-play-state:paused] ${animClass}`}>
        <MarqueeSet items={items} />
        <MarqueeSet items={items} />
      </div>
    </div>
  )
}

export function ClientLogosSection() {
  return (
    <section className="bg-primary py-space-9 overflow-hidden relative">
      {/* Edge fade */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[100px] z-10 bg-gradient-to-l from-primary to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[100px] z-10 bg-gradient-to-r from-primary to-transparent" />

      <div className="text-center mb-space-7">
        <h2 className="text-h3 font-bold text-white">לקוחות שבחרו בנו</h2>
        <div className="w-[50px] h-[3px] bg-gold mx-auto mt-space-2 rounded-full" />
        <p className="text-body-sm text-white/50 mt-space-2">חברות ועסקים שסומכים על ביטן את ביטן</p>
      </div>

      <div className="flex flex-col gap-space-4">
        <MarqueeRow items={ROW_1} direction="left" />
        <MarqueeRow items={ROW_2} direction="right" />
      </div>
    </section>
  )
}
