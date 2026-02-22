import { WhatsAppCTA, PhoneCTA } from '@/components/ui'

export function CTASection() {
  return (
    <section className="bg-primary py-space-9 md:py-space-10 px-6">
      <div className="max-w-content mx-auto text-center">
        <h2 className="text-white text-h2 font-bold">
          מוכנים להתחיל?
        </h2>
        <span className="gold-underline mt-3 mx-auto" />
        <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow mx-auto">
          צרו קשר עוד היום לפגישת ייעוץ ראשונית ללא עלות. נשמח להכיר ולהבין
          איך נוכל לעזור.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-space-7">
          <WhatsAppCTA label="שלחו הודעה בוואטסאפ" size="lg" />
          <PhoneCTA
            label="חייגו אלינו"
            variant="secondary"
            size="lg"
            className="border-white text-white hover:bg-white/10 hover:text-white"
          />
        </div>

        <p className="text-white/50 text-body-sm mt-space-5">
          ללא התחייבות · תשובה תוך 24 שעות · שיחה חינם
        </p>
      </div>
    </section>
  )
}
