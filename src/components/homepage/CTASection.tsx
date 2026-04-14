'use client'

import { motion } from 'motion/react'
import { fadeUp, underlineGrow } from '@/lib/motion'

const ctaStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

type CTAProps = {
  headline?: string
  subtitle?: string
}

export function CTASection({ headline, subtitle }: CTAProps) {
  return (
    <section className="bg-primary py-space-9 md:py-space-10 px-6">
      <motion.div
        className="max-w-content mx-auto text-center"
        variants={ctaStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <motion.h2 variants={fadeUp} className="text-white text-h2 font-bold">
          {headline ?? 'ביטן את ביטן — לשירותכם'}
        </motion.h2>
        <motion.span
          variants={underlineGrow}
          className="gold-underline mt-3 mx-auto"
        />
        <motion.p
          variants={fadeUp}
          className="text-white/85 text-body-lg mt-space-5 max-w-narrow mx-auto"
        >
          {subtitle ??
            'נשמח להכיר את העסק שלכם ולבחון כיצד נוכל לסייע.'}
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-wrap justify-center gap-4 mt-space-7"
        >
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-primary font-medium rounded-lg hover:bg-accent/90 transition-colors"
          >
            לתיאום פגישה
          </a>
          <a
            href="tel:+97235174295"
            className="inline-flex items-center gap-2 px-8 py-3 border border-white/40 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
          >
            03-5174295
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}
