import type { Metadata } from 'next'
import Image from 'next/image'
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
import { getAboutPage, getPartners, getTeamMembers } from '@/sanity/queries'
import { urlFor } from '@/sanity/image'
import type { Author } from '@/sanity/types'
import { TeamSection } from '@/components/TeamSection'
import { warnFallback } from '@/lib/fallback-warning'
import { Breadcrumb } from '@/components/Breadcrumb'
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
  title: 'אודות המשרד',
  description:
    'הכירו את אבי ורון ביטן — רואי חשבון ומשפטנים. ייעוץ מס, ליווי עסקי, דוחות כספיים וביקורת לחברות פרטיות ועסקים.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'אודות המשרד — ביטן את ביטן רואי חשבון',
    description:
      'הכירו את אבי ורון ביטן — רואי חשבון ומשפטנים. ייעוץ מס, ליווי עסקי וביקורת.',
  },
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
  const [page, partners, teamMembers] = await Promise.all([getAboutPage(), getPartners(), getTeamMembers()])
  if (!page) warnFallback('AboutPage')
  if (!partners || partners.length === 0) warnFallback('AboutPage:partners')

  const credentialsNote =
    page?.credentialsNote ??
    'רואי חשבון ויועצי מס מוסמכים — וגם משפטנים.'

  return (
    <div>
      {/* 1. Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <div className="mb-space-4 [&_a]:text-white/60 [&_a:hover]:text-white [&_span]:text-white/80 [&_svg]:text-white/40">
            <Breadcrumb items={[{ label: 'אודות' }]} />
          </div>
          <h1 className="text-white text-h1 font-bold">{page?.heroTitle ?? 'אודות המשרד'}</h1>
          <span className="gold-underline mt-4" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow">
            {page?.storyHeadline ??
              'רואי חשבון ומשפטנים — אבי ורון ביטן. מקצועיות, שקיפות ושירות ללא פשרות.'}
          </p>
          {credentialsNote && (
            <p className="text-gold text-body font-medium mt-space-3">
              {credentialsNote}
            </p>
          )}
        </div>
      </section>

      {/* 2. Story */}
      <RevealSection className="py-space-10 px-6">
        <div className="max-w-content mx-auto">
          <div className="max-w-narrow space-y-6 text-text-secondary text-body leading-relaxed">
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
          <SectionHeader centered subtitle="המייסדים שמובילים את המשרד.">
            {page?.partnersTitle ?? 'השותפים המייסדים'}
          </SectionHeader>

          <RevealGroup className="grid md:grid-cols-2 gap-space-7 mt-space-8 max-w-[900px] mx-auto">
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

      {/* 3b. Team */}
      <TeamSection
        members={teamMembers}
        title={page?.teamTitle}
        subtitle={page?.teamSubtitle}
      />

      {/* 4. Differentiators */}
      <RevealSection className="py-space-10 px-6">
        <div className="max-w-content mx-auto">
          <SectionHeader
            centered
            subtitle={page?.differentiatorsSubtitle ?? 'הגורמים שהופכים את השירות שלנו לייחודי.'}
          >
            {page?.differentiatorsTitle ?? 'מה מייחד אותנו'}
          </SectionHeader>

          <RevealGroup className="grid md:grid-cols-2 lg:grid-cols-3 gap-space-5 mt-space-8">
            {(page?.differentiators ?? FALLBACK_DIFFERENTIATORS).map((item) => {
              const Icon = getIcon(item.icon)
              return (
                <RevealItem key={item._key}>
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
            subtitle={page?.audienceSubtitle ?? 'אנחנו מלווים מגוון רחב של לקוחות — מחברות פרטיות ובעלי שליטה ועד עסקים קטנים ועצמאים.'}
          >
            {page?.audienceTitle ?? 'למי אנחנו מתאימים?'}
          </SectionHeader>

          <RevealGroup className="grid md:grid-cols-2 lg:grid-cols-4 gap-space-5 mt-space-8">
            {(page?.audienceCards ?? FALLBACK_AUDIENCE).map((card) => {
              const Icon = getIcon(card.icon)
              return (
                <RevealItem key={card._key}>
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
            subtitle={page?.processSubtitle ?? 'תהליך פשוט ושקוף — מהפנייה הראשונה ועד ליווי שוטף.'}
          >
            {page?.processTitle ?? 'איך מתחילים?'}
          </SectionHeader>

          <RevealGroup className="mt-space-8 max-w-narrow mx-auto space-y-space-5">
            {(page?.processSteps ?? FALLBACK_PROCESS).map((step) => (
              <RevealItem key={step._key}>
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
            subtitle={page?.valuesSubtitle ?? 'הערכים שמנחים אותנו בכל יום עבודה.'}
          >
            {page?.valuesTitle ?? 'הערכים שלנו'}
          </SectionHeader>

          <RevealGroup className="grid md:grid-cols-2 lg:grid-cols-4 gap-space-5 mt-space-8">
            {(page?.values ?? FALLBACK_VALUES).map((value) => {
              const Icon = getIcon(value.icon)
              return (
                <RevealItem key={value._key}>
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
  const imageUrl = urlFor(partner.image, 600)

  return (
    <div className="group bg-white rounded-2xl border border-border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-gold/30">
      {/* Portrait photo — 3:4 aspect */}
      {imageUrl ? (
        <div className="relative aspect-[3/4] bg-primary/5 overflow-hidden">
          <Image
            src={imageUrl}
            alt={partner.name}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 450px"
          />
        </div>
      ) : (
        <div className="aspect-[3/4] bg-gradient-to-br from-primary/5 to-gold/5 flex items-center justify-center">
          <User className="h-20 w-20 text-primary/20" />
        </div>
      )}

      {/* Info */}
      <div className="p-space-5">
        <h3 className="text-h3 font-bold text-primary">{partner.name}</h3>
        {partner.role && (
          <p className="text-gold font-semibold text-body-sm mt-1 tracking-wide">
            {partner.role}
          </p>
        )}
        {partner.bio && (
          <p className="text-text-secondary text-body mt-space-3 leading-relaxed">
            {partner.bio}
          </p>
        )}
        {partner.specializations && partner.specializations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-space-4">
            {partner.specializations.map((spec) => (
              <span
                key={spec}
                className="text-caption bg-primary/5 text-primary/80 px-3 py-1 rounded-full font-medium"
              >
                {spec}
              </span>
            ))}
          </div>
        )}
        {partner.experienceYears && (
          <p className="text-text-muted text-body-sm mt-space-3 font-medium">
            <LTR>{partner.experienceYears}+</LTR> שנות ניסיון
          </p>
        )}
      </div>
    </div>
  )
}

/* ─── Fallback content (renders when Sanity has no aboutPage doc) ─── */

function FallbackStory() {
  return (
    <>
      <p className="text-body-lg">
        <strong className="text-primary">אבי ורון ביטן</strong>, רואי חשבון
        ומשפטנים, שותפים מייסדים של משרד{' '}
        <strong className="text-primary">ביטן את ביטן</strong>. המשרד מעניק
        שירותי ראיית חשבון, ייעוץ מס, ביקורת, דוחות כספיים וליווי עסקי מקצועי —
        לחברות פרטיות, בעלי שליטה ועסקים בכל גודל.
      </p>
      <p>
        אנחנו מאמינים ששירות חשבונאי צריך להיות מקצועי, שקוף ונגיש. כל לקוח
        מקבל ליווי צמוד ומענה ישיר מרואה חשבון, עם תהליכי עבודה מסודרים וזמני
        תגובה ברורים. אנחנו לא רק מגישים דוחות — אנחנו שותפים לניהול הפיננסי
        של העסק.
      </p>
      <p>
        המשרד ממשיך מסורת מקצועית שהחלה עם{' '}
        <strong className="text-primary">שלמה ביטן, רו&quot;ח</strong>, ושומר על
        הערכים שליוו אותנו מהיום הראשון: יושרה, מקצועיות ומחויבות ללקוח.
      </p>
      <p>
        היום, המשרד ממוקם במגדל אלקטרה סיטי בתל אביב ומציע מגוון רחב של
        שירותים: הנהלת חשבונות, ייעוץ מס, דוחות כספיים, ביקורת, ליווי עסקי,
        תכנון מס וניהול שכר.
      </p>
    </>
  )
}

const FALLBACK_PARTNERS: Author[] = [
  {
    _id: 'author-avi',
    name: 'אבי ביטן',
    slug: { _type: 'slug', current: 'avi-bitan' },
    role: 'רואה חשבון ומשפטן, שותף מייסד',
    bio: 'רואה חשבון ומשפטן. מלווה חברות פרטיות, בעלי שליטה ועסקים בתחומי ייעוץ מס, ביקורת ודוחות כספיים.',
    isPartner: true,
  },
  {
    _id: 'author-ron',
    name: 'רון ביטן',
    slug: { _type: 'slug', current: 'ron-bitan' },
    role: 'רואה חשבון ומשפטן, שותף מייסד',
    bio: 'רואה חשבון ומשפטן. מלווה חברות ולקוחות פרטיים בליווי עסקי, תכנון מס ודוחות כספיים.',
    isPartner: true,
  },
]

const FALLBACK_DIFFERENTIATORS = [
  {
    _key: 'd1',
    title: 'ידע חשבונאי ומשפטי',
    description:
      'רואי חשבון ומשפטנים — שילוב ייחודי שמאפשר מענה רחב ומקצועי ללקוחות.',
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
    title: 'חברות פרטיות ובעלי שליטה',
    description:
      'ליווי מקיף לחברות: ביקורת, דוחות כספיים, תכנון מס וייצוג מול הרשויות.',
    icon: 'building',
  },
  {
    _key: 'a2',
    title: 'חברות בצמיחה',
    description:
      'חברות שזקוקות לשותף פיננסי לניהול השוטף, תקצוב ותכנון אסטרטגי.',
    icon: 'rocket',
  },
  {
    _key: 'a3',
    title: 'עסקים קטנים ובינוניים',
    description:
      'הנהלת חשבונות, ניהול שכר ודיווח שוטף — בהתאמה לגודל העסק.',
    icon: 'store',
  },
  {
    _key: 'a4',
    title: 'עצמאים ונותני שירות',
    description:
      'הנהלת חשבונות מסודרת, דוחות שנתיים ותכנון מס חכם.',
    icon: 'user',
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
      'רואי חשבון ומשפטנים בעלי הסמכה מלאה, עם ידע מעמיק ועדכני בדיני מס וחשבונאות.',
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
    title: 'זמינות',
    description:
      'תמיד ניתן להגיע אלינו — בטלפון, בוואטסאפ או בפגישה. זמני תגובה קצרים וברורים.',
    icon: 'headphones',
  },
  {
    _key: 'v4',
    title: 'יציבות',
    description:
      'משרד עם בסיס מקצועי מוצק ומוניטין שנבנה לאורך שנים.',
    icon: 'building',
  },
]
