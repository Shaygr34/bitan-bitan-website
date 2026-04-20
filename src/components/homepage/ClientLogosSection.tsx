/**
 * Client Logos Marquee — zero dead space, seamless infinite scroll.
 *
 * Architecture:
 * - Items are tightly packed (small gap, no space-around)
 * - Each strip is duplicated enough times to overflow any viewport
 * - Two identical strips animate; translateX(calc(-100% - gap)) loops perfectly
 * - mask-image gradient fades edges (Stripe pattern)
 */

import styles from './ClientLogosMarquee.module.css'

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
      <li className={styles.slot}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.src}
          alt={entry.alt}
          className={entry.large ? styles.imgLarge : styles.img}
          loading="lazy"
        />
      </li>
    )
  }
  return (
    <li className={styles.slot}>
      <div className={styles.textLogo}>
        <span className={styles.textName}>{entry.name}</span>
        <span className={styles.textSub}>{entry.subtitle}</span>
      </div>
    </li>
  )
}

/**
 * One dense strip of logos. Items repeat 2× inside each strip
 * to guarantee the strip is always wider than the widest viewport.
 * On 1440px desktop with ~120px avg item + 40px gap: 22 items = ~3500px.
 */
function MarqueeStrip({ items }: { items: LogoEntry[] }) {
  // Repeat items to ensure strip is always wider than viewport
  const doubled = [...items, ...items]
  return (
    <ul className={styles.marqueeContent}>
      {doubled.map((entry, i) => (
        <Slot key={i} entry={entry} />
      ))}
    </ul>
  )
}

function MarqueeRow({ items, reverse }: { items: LogoEntry[]; reverse?: boolean }) {
  return (
    <div className={`${styles.marquee} ${reverse ? styles.marqueeReverse : ''}`}>
      {/* Two identical strips for the seamless loop */}
      <MarqueeStrip items={items} />
      <MarqueeStrip items={items} />
    </div>
  )
}

export function ClientLogosSection() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>לקוחות שבחרו בנו</h2>
        <div className={styles.accent} />
      </div>
      <div className={styles.rows}>
        <MarqueeRow items={ROW_1} />
        <MarqueeRow items={ROW_2} reverse />
      </div>
    </section>
  )
}
