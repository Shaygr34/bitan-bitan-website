import type { Metadata } from 'next'
import { PortableText } from 'next-sanity'
import {
  SectionHeader,
  Card,
  CardBody,
  WhatsAppCTA,
  PhoneCTA,
  RevealSection,
  RevealGroup,
  RevealItem,
  LTR,
} from '@/components/ui'
import { getAboutPage, getPartners } from '@/sanity/queries'
import { urlFor } from '@/sanity/image'
import type { Author } from '@/sanity/types'
import {
  Shield,
  Users,
  TrendingUp,
  Headphones,
  Award,
  Handshake,
  Building,
  User,
  Briefcase,
  GraduationCap,
  Store,
  Rocket,
  MapPin,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'אודות — ביטן את ביטן רואי חשבון',
  description:
    'הכירו את אבי ורון ביטן — רואי חשבון עם ניסיון של למעלה מ-15 שנה בייעוץ מס, ליווי עסקי ודוחות כספיים.',
}

const ICON_MAP: Record<string, LucideIcon> = {
  shield: Shield,
  users: Users,
  'trending-up': TrendingUp,
  headphones: Headphones,
  award: Award,
  handshake: Handshake,
  building: Building,
  user: User,
  briefcase: Briefcase,
  'graduation-cap': GraduationCap,
  store: Store,
  rocket: Rocket,
  'map-pin': MapPin,
}

function getIcon(name?: string): LucideIcon {
  if (!name) return Award
  return ICON_MAP[name] ?? Award
}

export default async function AboutPage() {
  const [page, partners] = await Promise.all([getAboutPage(), getPartners()])

  return (
    <div>
      {/* 1. Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <h1 className="text-white text-h1 font-bold">אודות המשרד</h1>
          <span className="gold-underline mt-4" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow">
            {page?.storyHeadline ??
              'רואי חשבון מהדור השני — אבי ורון ביטן. מקצועיות, יחס אישי ושירות שלא מתפשר.'}
          </p>
        </div>
      </section>

      {/* 2. Story */}
      <RevealSection className="py-space-10 px-6">
        <div className="max-w-content mx-auto">
          <SectionHeader subtitle="הרקע שלנו בקצרה.">
            הסיפור שלנו
          </SectionHeader>

          <div className="mt-space-8 max-w-narrow space-y-6 text-text-secondary text-body leading-relaxed">
            {page?.storyBody ? (
              <PortableText value={page.storyBody} />
            ) : (
              <FallbackStory />
            )}
          </div>
        </div>
      </RevealSection>

      {/* 3. Partners */}
      <RevealSection className="bg-surface py-space-10 px-6">
        <div className="max-w-content mx-auto">
          <SectionHeader centered>השותפים</SectionHeader>

          <RevealGroup className="grid md:grid-cols-2 gap-space-7 mt-space-8 max-w-[800px] mx-auto">
            {(partners.length > 0 ? partners : FALLBACK_PARTNERS).map(
              (partner) => (
                <RevealItem key={partner._id}>
                  <PartnerCard partner={partner} />
                </RevealItem>
              ),
            )}
          </RevealGroup>
        </div>
      </RevealSection>

      {/* 4. Differentiators */}
      <RevealSection className="py-space-10 px-6">
        <div className="max-w-content mx-auto">
          <SectionHeader
            centered
            subtitle="הגורמים שהופכים את השירות שלנו לייחודי."
          >
            מה מייחד אותנו
          </SectionHeader>

          <RevealGroup className="grid md:grid-cols-2 lg:grid-cols-3 gap-space-5 mt-space-8">
            {(page?.differentiators ?? FALLBACK_DIFFERENTIATORS).map((item) => {
              const Icon = getIcon(item.icon)
              return (
                <RevealItem key={'_key' in item ? item._key : item.title}>
                  <Card>
                    <CardBody>
                      <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-space-3">
                        <Icon className="h-6 w-6 text-gold" />
                      </div>
                      <h3 className="text-h4 font-semibold text-primary">
                        {item.title}
                      </h3>
                      <p className="text-text-secondary text-body mt-2">
                        {item.description}
                      </p>
                    </CardBody>
                  </Card>
                </RevealItem>
              )
            })}
          </RevealGroup>
        </div>
      </RevealSection>

      {/* 5. Audience */}
      <RevealSection className="bg-surface py-space-10 px-6">
        <div className="max-w-content mx-auto">
          <SectionHeader
            centered
            subtitle="אנחנו עובדים עם מגוון רחב של לקוחות — מעצמאים ועד חברות."
          >
            למי אנחנו מתאימים?
          </SectionHeader>

          <RevealGroup className="grid md:grid-cols-2 lg:grid-cols-4 gap-space-5 mt-space-8">
            {(page?.audienceCards ?? FALLBACK_AUDIENCE).map((card) => {
              const Icon = getIcon(card.icon)
              return (
                <RevealItem key={'_key' in card ? card._key : card.title}>
                  <Card>
                    <CardBody className="text-center">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-space-3">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-h4 font-semibold text-primary">
                        {card.title}
                      </h3>
                      <p className="text-text-secondary text-body-sm mt-2">
                        {card.description}
                      </p>
                    </CardBody>
                  </Card>
                </RevealItem>
              )
            })}
          </RevealGroup>
        </div>
      </RevealSection>

      {/* 6. Process Steps */}
      <RevealSection className="py-space-10 px-6">
        <div className="max-w-content mx-auto">
          <SectionHeader
            centered
            subtitle="תהליך פשוט ושקוף — מהפנייה הראשונה ועד ליווי שוטף."
          >
            איך מתחילים?
          </SectionHeader>

          <RevealGroup className="mt-space-8 max-w-narrow mx-auto space-y-space-5">
            {(page?.processSteps ?? FALLBACK_PROCESS).map((step) => (
              <RevealItem key={'_key' in step ? step._key : step.stepNumber}>
                <div className="flex gap-space-4 items-start">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-gold flex items-center justify-center">
                    <span
                      className="text-primary font-bold text-body-lg"
                      dir="ltr"
                    >
                      {step.stepNumber}
                    </span>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-h4 font-bold text-primary">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary text-body mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </RevealSection>

      {/* 7. Values */}
      <RevealSection className="bg-surface py-space-10 px-6">
        <div className="max-w-content mx-auto">
          <SectionHeader
            centered
            subtitle="הערכים שמנחים אותנו בכל יום עבודה."
          >
            הערכים שלנו
          </SectionHeader>

          <RevealGroup className="grid md:grid-cols-2 lg:grid-cols-4 gap-space-5 mt-space-8">
            {(page?.values ?? FALLBACK_VALUES).map((value) => {
              const Icon = getIcon(value.icon)
              return (
                <RevealItem key={'_key' in value ? value._key : value.title}>
                  <Card>
                    <CardBody>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-space-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-h4 font-semibold text-primary">
                        {value.title}
                      </h3>
                      <p className="text-text-secondary text-body mt-2">
                        {value.description}
                      </p>
                    </CardBody>
                  </Card>
                </RevealItem>
              )
            })}
          </RevealGroup>
        </div>
      </RevealSection>

      {/* 8. Office Note + CTA */}
      <section className="bg-primary py-space-10 px-6">
        <div className="max-w-content mx-auto text-center">
          {(page?.officeNote || !page) && (
            <div className="mb-space-7 flex items-center justify-center gap-2 text-white/70 text-body">
              <MapPin className="h-5 w-5 text-gold shrink-0" />
              <p>
                {page?.officeNote ??
                  'המשרד ממוקם במגדל אלקטרה סיטי, הרכבת 58, קומה 11, תל אביב — סביבת עבודה מודרנית ונגישה.'}
              </p>
            </div>
          )}

          <h2 className="text-white text-h2 font-bold">
            {page?.ctaHeadline ?? 'רוצים להכיר אותנו?'}
          </h2>
          <span className="gold-underline mt-3 mx-auto" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow mx-auto">
            {page?.ctaSubtitle ??
              'נשמח לשבת איתכם לפגישת היכרות ללא עלות ולהבין איך נוכל לעזור.'}
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
        </div>
      </section>
    </div>
  )
}

/* ─── Partner Card ─── */

function PartnerCard({ partner }: { partner: Author }) {
  const imageUrl = urlFor(partner.image, 400)

  return (
    <Card hover={false} className="overflow-hidden">
      {imageUrl ? (
        <div className="h-48 bg-primary/5 overflow-hidden -m-space-5 mb-0">
          <img
            src={imageUrl}
            alt={partner.name}
            className="w-full h-full object-cover object-top"
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center -m-space-5 mb-0">
          <User className="h-16 w-16 text-primary/30" />
        </div>
      )}
      <CardBody className="pt-space-4">
        <h3 className="text-h3 font-bold text-primary">{partner.name}</h3>
        {partner.role && (
          <p className="text-gold font-medium text-body-sm mt-1">
            {partner.role}
          </p>
        )}
        {partner.bio && (
          <p className="text-text-secondary text-body mt-space-3 leading-relaxed">
            {partner.bio}
          </p>
        )}
        {partner.specializations && partner.specializations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-space-3">
            {partner.specializations.map((spec) => (
              <span
                key={spec}
                className="text-caption bg-primary/5 text-primary px-2.5 py-1 rounded-full"
              >
                {spec}
              </span>
            ))}
          </div>
        )}
        {partner.experienceYears && (
          <p className="text-text-muted text-caption mt-space-3">
            <LTR>{partner.experienceYears}+</LTR> שנות ניסיון
          </p>
        )}
      </CardBody>
    </Card>
  )
}

/* ─── Fallback content (renders when Sanity has no aboutPage doc) ─── */

function FallbackStory() {
  return (
    <>
      <p className="text-body-lg">
        <strong className="text-primary">אבי ורון ביטן</strong>, רואי חשבון,
        מובילים את משרד{' '}
        <strong className="text-primary">ביטן את ביטן</strong> מתוך אמונה
        פשוטה: שירות חשבונאי צריך להיות מקצועי, אישי ונגיש. עם ניסיון משולב של
        למעלה מ-15 שנה בייעוץ מס, דוחות כספיים וליווי עסקי, אנחנו מלווים
        לקוחות מכל גודל — מעצמאים ועד חברות בצמיחה.
      </p>
      <p>
        את הבסיס המקצועי הניח{' '}
        <strong className="text-primary">שלמה ביטן, רו&quot;ח</strong>, שהקים את
        המשרד המקורי ובנה מוניטין של יושרה ומומחיות. אבי ורון לקחו את הערכים
        שספגו והוסיפו גישה עדכנית ומענה טכנולוגי — שילוב שמאפשר ללקוחות שקט
        נפשי מלא.
      </p>
      <p>
        היום, המשרד ממוקם במגדל אלקטרה סיטי בתל אביב ומעניק שירות מקיף:
        הנהלת חשבונות, ייעוץ מס, דוחות כספיים, ביקורת, מיסוי בינלאומי, ליווי
        עסקי ושכר. כל לקוח מקבל יחס אישי וזמינות גבוהה — ללא תלות בגודל העסק.
      </p>
    </>
  )
}

const FALLBACK_PARTNERS: Author[] = [
  {
    _id: 'author-avi',
    name: 'אבי ביטן',
    slug: { _type: 'slug', current: 'avi-bitan' },
    role: 'רואה חשבון, שותף מייסד',
    bio: 'רואה חשבון עם ניסיון של למעלה מ-15 שנה בייעוץ מס, ביקורת ודוחות כספיים. מתמחה בליווי עצמאים וחברות קטנות ובינוניות.',
    isPartner: true,
    specializations: ['ייעוץ מס', 'ביקורת חשבונות', 'דוחות כספיים'],
    experienceYears: 15,
  },
  {
    _id: 'author-ron',
    name: 'רון ביטן',
    slug: { _type: 'slug', current: 'ron-bitan' },
    role: 'רואה חשבון, שותף',
    bio: 'רואה חשבון המתמחה בליווי עסקי, מיסוי בינלאומי וחברות הייטק. מביא גישה חדשנית ומענה טכנולוגי מתקדם.',
    isPartner: true,
    specializations: ['מיסוי בינלאומי', 'ליווי עסקי', 'הייטק'],
    experienceYears: 15,
  },
]

const FALLBACK_DIFFERENTIATORS = [
  {
    _key: 'd1',
    title: 'ניסיון דור שני',
    description:
      'שילוב של ערכים מבוססים עם גישה מקצועית עדכנית — הטוב משני העולמות.',
    icon: 'shield',
  },
  {
    _key: 'd2',
    title: 'יחס אישי',
    description:
      'אנחנו מכירים כל לקוח בשם. תמיד תדברו ישירות עם רואה חשבון, לא עם מזכירה.',
    icon: 'users',
  },
  {
    _key: 'd3',
    title: 'מענה מהיר',
    description:
      'זמינות גבוהה וחזרה מהירה — כי אנחנו יודעים שזמן שלכם שווה כסף.',
    icon: 'headphones',
  },
  {
    _key: 'd4',
    title: 'שירות מקיף',
    description:
      'הכל תחת קורת גג אחת: חשבונאות, מיסוי, ביקורת, ליווי עסקי ושכר.',
    icon: 'briefcase',
  },
  {
    _key: 'd5',
    title: 'שקיפות מלאה',
    description:
      'הצעת מחיר ברורה מראש, ללא הפתעות. אתם תמיד יודעים על מה אתם משלמים.',
    icon: 'trending-up',
  },
  {
    _key: 'd6',
    title: 'טכנולוגיה מתקדמת',
    description: 'עבודה עם כלים דיגיטליים מתקדמים שחוסכים לכם זמן וכסף.',
    icon: 'rocket',
  },
]

const FALLBACK_AUDIENCE = [
  {
    _key: 'a1',
    title: 'עצמאים',
    description:
      'פרילנסרים ונותני שירות שרוצים הנהלת חשבונות מסודרת ותכנון מס חכם.',
    icon: 'user',
  },
  {
    _key: 'a2',
    title: 'עסקים קטנים',
    description:
      'בעלי עסקים שמחפשים שותף פיננסי אמין לניהול השוטף ולצמיחה.',
    icon: 'store',
  },
  {
    _key: 'a3',
    title: 'חברות בע"מ',
    description:
      'חברות שצריכות ביקורת, דוחות כספיים, ניהול שכר ותכנון מס מקצועי.',
    icon: 'building',
  },
  {
    _key: 'a4',
    title: 'סטארטאפים',
    description:
      'חברות טכנולוגיה עם צרכים ייחודיים במיסוי בינלאומי וגיוסי הון.',
    icon: 'rocket',
  },
]

const FALLBACK_PROCESS = [
  {
    _key: 'p1',
    stepNumber: 1,
    title: 'פגישת היכרות',
    description:
      'נשב יחד (בזום או במשרד), נכיר את העסק שלכם ונבין את הצרכים — ללא עלות וללא התחייבות.',
  },
  {
    _key: 'p2',
    stepNumber: 2,
    title: 'הצעת מחיר שקופה',
    description:
      'נשלח הצעה מפורטת ומותאמת אישית, עם פירוט מלא של השירותים והעלויות.',
  },
  {
    _key: 'p3',
    stepNumber: 3,
    title: 'העברת חומרים',
    description:
      'תעבירו לנו את המסמכים הדרושים — אנחנו נדריך אתכם בדיוק מה נדרש.',
  },
  {
    _key: 'p4',
    stepNumber: 4,
    title: 'ליווי שוטף',
    description:
      'מרגע ההתחלה אנחנו זמינים לכל שאלה. תקבלו עדכונים, תזכורות ושירות פרואקטיבי לאורך כל השנה.',
  },
]

const FALLBACK_VALUES = [
  {
    _key: 'v1',
    title: 'מקצועיות',
    description:
      'רואי חשבון בעלי הסמכה מלאה, עם ידע מעמיק ועדכני בדיני מס וחשבונאות.',
    icon: 'award',
  },
  {
    _key: 'v2',
    title: 'אמינות',
    description:
      'שקיפות מלאה, עמידה בלוחות זמנים ומחויבות לטובת הלקוח — בכל פרויקט.',
    icon: 'handshake',
  },
  {
    _key: 'v3',
    title: 'יחס אישי',
    description:
      'כל לקוח מקבל ליווי צמוד וזמינות גבוהה. אנחנו מכירים כל לקוח בשם.',
    icon: 'users',
  },
  {
    _key: 'v4',
    title: 'יציבות',
    description:
      'משרד עם בסיס מוצק וניסיון עשיר — יציבות שמעניקה שקט נפשי.',
    icon: 'building',
  },
]
