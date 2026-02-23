'use client'

import { motion } from 'motion/react'
import { WhatsAppCTA, PhoneCTA } from '@/components/ui'
import { fadeUp, fadeIn, underlineGrow } from '@/lib/motion'

const heroStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

type HeroProps = {
  headline?: string
  subtitle?: string
  footerNote?: string
}

export function HeroSection({ headline, subtitle, footerNote }: HeroProps) {
  return (
    <section className="bg-primary py-space-9 md:py-space-10 px-6">
      <motion.div
        className="max-w-content mx-auto"
        variants={heroStagger}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={fadeUp}
          className="text-white text-h1 font-bold leading-tight"
        >
          {headline ?? 'המומחים הפיננסיים של העסק שלכם'}
        </motion.h1>

        <motion.span
          variants={underlineGrow}
          className="gold-underline mt-4 origin-right"
        />

        <motion.p
          variants={fadeUp}
          className="text-white/85 text-body-lg mt-space-5 max-w-narrow"
        >
          {subtitle ??
            'משרד רואי חשבון ביטן את ביטן — רואי חשבון, יועצי מס ומשפטנים. ייעוץ מס, דוחות כספיים וליווי עסקי מקצועי.'}
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mt-space-7">
          <WhatsAppCTA label="שלחו הודעה בוואטסאפ" size="lg" />
          <PhoneCTA
            label="חייגו אלינו"
            variant="secondary"
            size="lg"
            className="border-white text-white hover:bg-white/10 hover:text-white"
          />
        </motion.div>

        <motion.p
          variants={fadeIn}
          className="text-white/60 text-body-sm mt-space-5"
        >
          {footerNote ?? 'רואי חשבון ומשפטנים · ייעוץ מס וליווי עסקי · תל אביב'}
        </motion.p>
      </motion.div>
    </section>
  )
}
