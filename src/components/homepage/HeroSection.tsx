import { WhatsAppCTA, PhoneCTA } from '@/components/ui'

export function HeroSection() {
  return (
    <section className="bg-primary py-space-9 md:py-space-10 px-6">
      <div className="max-w-content mx-auto">
        <h1 className="text-white text-h1 font-bold leading-tight">
          המומחים הפיננסיים של העסק שלכם
        </h1>
        <span className="gold-underline mt-4" />
        <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow">
          משרד רואי חשבון ביטן את ביטן — דור שני של מומחיות פיננסית, ייעוץ מס
          וליווי עסקי מקצועי.
        </p>

        <div className="flex flex-wrap gap-4 mt-space-7">
          <WhatsAppCTA label="שלחו הודעה בוואטסאפ" size="lg" />
          <PhoneCTA
            label="חייגו אלינו"
            variant="secondary"
            size="lg"
            className="border-white text-white hover:bg-white/10 hover:text-white"
          />
        </div>

        <p className="text-white/60 text-body-sm mt-space-5">
          <span dir="ltr">30+</span> שנות ניסיון · דור שני של רואי חשבון · תל
          אביב
        </p>
      </div>
    </section>
  )
}
