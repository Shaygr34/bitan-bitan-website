import { SectionHeader } from '@/components/ui'
import { urlFor } from '@/sanity/image'
import type { ClientLogo } from '@/sanity/types'

/* ── Placeholder logos (shown when no CMS logos exist) ── */

const PLACEHOLDERS = [
  'חברה א׳',
  'חברה ב׳',
  'חברה ג׳',
  'חברה ד׳',
  'חברה ה׳',
  'חברה ו׳',
  'חברה ז׳',
  'חברה ח׳',
  'חברה ט׳',
  'חברה י׳',
]

function PlaceholderLogo({ name }: { name: string }) {
  return (
    <div className="flex-shrink-0 w-[120px] h-[60px] rounded-lg bg-gray-100 flex items-center justify-center">
      <span className="text-sm font-medium text-primary/60">{name}</span>
    </div>
  )
}

/* ── Single logo item ── */

function LogoItem({ logo }: { logo: ClientLogo }) {
  const src = urlFor(logo.logo, 240)
  if (!src) return null

  const img = (
    <img
      src={src}
      alt={logo.companyName}
      className="w-[120px] h-[60px] object-contain grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
      loading="lazy"
    />
  )

  if (logo.url) {
    return (
      <a
        href={logo.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0"
        aria-label={logo.companyName}
      >
        {img}
      </a>
    )
  }

  return <div className="flex-shrink-0">{img}</div>
}

/* ── Scrolling row ── */

type RowProps = {
  logos: ClientLogo[]
  direction: 'left' | 'right'
}

function ScrollRow({ logos, direction }: RowProps) {
  const hasLogos = logos.length > 0
  const animClass = direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'

  return (
    <div className="overflow-hidden group">
      <div className={`flex gap-space-8 w-max group-hover:[animation-play-state:paused] ${animClass}`}>
        {/* Render logos twice for seamless loop */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex gap-space-8" aria-hidden={copy === 1 || undefined}>
            {hasLogos
              ? logos.map((logo) => <LogoItem key={`${copy}-${logo._id}`} logo={logo} />)
              : PLACEHOLDERS.map((name) => <PlaceholderLogo key={`${copy}-${name}`} name={name} />)}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main section ── */

type Props = {
  logos: ClientLogo[]
}

export function ClientLogosSection({ logos }: Props) {
  // Hide section entirely when no real logos exist
  if (logos.length === 0) return null

  // Split logos into two rows for opposite-direction scrolling
  const mid = Math.ceil(logos.length / 2)
  const row1 = logos.length > 0 ? logos.slice(0, mid) : []
  const row2 = logos.length > 0 ? logos.slice(mid) : []

  return (
    <section className="py-space-9 bg-white">
      <div className="max-w-content mx-auto px-space-4 mb-space-8">
        <SectionHeader centered>לקוחות שסומכים עלינו</SectionHeader>
      </div>

      <div className="flex flex-col gap-space-6">
        <ScrollRow logos={row1} direction="left" />
        <ScrollRow logos={row2} direction="right" />
      </div>
    </section>
  )
}
