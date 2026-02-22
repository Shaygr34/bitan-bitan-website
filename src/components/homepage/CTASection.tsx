'use client'

import { motion } from 'motion/react'
import { WhatsAppCTA, PhoneCTA } from '@/components/ui'
import { fadeUp, underlineGrow } from '@/lib/motion'

const ctaStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

export function CTASection() {
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
          מוכנים להתחיל?
        </motion.h2>
        <motion.span
          variants={underlineGrow}
          className="gold-underline mt-3 mx-auto"
        />
        <motion.p
          variants={fadeUp}
          className="text-white/85 text-body-lg mt-space-5 max-w-narrow mx-auto"
        >
          צרו קשר עוד היום לפגישת ייעוץ ראשונית ללא עלות. נשמח להכיר ולהבין
          איך נוכל לעזור.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-wrap justify-center gap-4 mt-space-7"
        >
          <WhatsAppCTA label="שלחו הודעה בוואטסאפ" size="lg" />
          <PhoneCTA
            label="חייגו אלינו"
            variant="secondary"
            size="lg"
            className="border-white text-white hover:bg-white/10 hover:text-white"
          />
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-white/50 text-body-sm mt-space-5"
        >
          ללא התחייבות · תשובה תוך 24 שעות · שיחה חינם
        </motion.p>
      </motion.div>
    </section>
  )
}
