/**
 * Client Logos Marquee — production implementation.
 *
 * Based on the Ryan Mulligan / CSS-Tricks infinite marquee pattern:
 * - Parent is display:flex with overflow:hidden and a --gap variable
 * - Two identical children, each with min-width:100% and flex-shrink:0
 * - Animation: translateX(calc(-100% - var(--gap)))
 * - min-width:100% guarantees items fill the viewport on ANY screen size
 * - The gap variable in the translateX calc prevents seam misalignment
 *
 * All image logos are white-on-transparent. No CSS filter.
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

function MarqueeList({ items }: { items: LogoEntry[] }) {
  return (
    <ul className={styles.marqueeContent}>
      {items.map((entry, i) => (
        <Slot key={i} entry={entry} />
      ))}
    </ul>
  )
}

function MarqueeRow({ items, reverse }: { items: LogoEntry[]; reverse?: boolean }) {
  return (
    <div className={`${styles.marquee} ${reverse ? styles.marqueeReverse : ''}`}>
      <MarqueeList items={items} />
      <MarqueeList items={items} />
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
