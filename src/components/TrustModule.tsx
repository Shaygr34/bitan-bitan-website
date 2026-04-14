'use client'

import {
  SectionHeader,
  RevealSection,
  RevealGroup,
  RevealItem,
} from '@/components/ui'
import {
  PhoneCall,
  Users,
  ClipboardCheck,
  Headset,
  ShieldCheck,
  Eye,
  Clock,
  HeartHandshake,
  FileText,
  Receipt,
  CreditCard,
  FolderOpen,
} from 'lucide-react'

/* ─── Section 1: How it works ─── */

const PROCESS_STEPS = [
  {
    icon: PhoneCall,
    title: 'פנייה ראשונית',
    description: 'צרו קשר בטלפון, בוואטסאפ או דרך הטופס באתר. נקבע שיחת היכרות קצרה.',
  },
  {
    icon: Users,
    title: 'פגישת היכרות (ללא עלות)',
    description: 'נכיר את העסק, נבין את הצרכים ונציג הצעת מחיר שקופה — ללא התחייבות.',
  },
  {
    icon: ClipboardCheck,
    title: 'קליטה והעברה מסודרת',
    description: 'תהליך מובנה: העברת מסמכים, הגדרת גישות למערכות ותיאום ציפיות ברורות.',
  },
  {
    icon: Headset,
    title: 'שירות שוטף וליווי צמוד',
    description: 'מענה מהיר, דיווחים בזמן, עדכונים יזומים על שינויים ברגולציה — לאורך כל הדרך.',
  },
] as const

/* ─── Section 2: Transparency promises ─── */

const PROMISES = [
  {
    icon: ShieldCheck,
    title: 'הצעת מחיר שקופה',
    description: 'תדעו בדיוק כמה תשלמו — ללא הפתעות ובלי עלויות נסתרות.',
  },
  {
    icon: Eye,
    title: 'גישה מלאה למידע',
    description: 'כל הדוחות, המסמכים והנתונים שלכם זמינים לכם בכל רגע.',
  },
  {
    icon: Clock,
    title: 'זמני תגובה מחייבים',
    description: 'תשובה ראשונית תוך יום עסקים אחד — לכל פנייה ושאלה.',
  },
  {
    icon: HeartHandshake,
    title: 'מחויבות לטווח ארוך',
    description: 'ליווי מקצועי רציף — בנוי על אמון ותוצאות.',
  },
] as const

/* ─── Section 3: What to prepare ─── */

const DOCS_TO_PREPARE = [
  {
    icon: FileText,
    title: 'תעודת זהות / תעודת התאגדות',
    description: 'ליחידים — ת.ז., לחברות — תעודת רישום מרשם החברות.',
  },
  {
    icon: Receipt,
    title: 'אישורים מרשויות המס',
    description: 'אישורי ניכוי מס במקור, פטורים, וכל מסמך רלוונטי מפקיד שומה ומע"מ.',
  },
  {
    icon: CreditCard,
    title: 'דפי חשבון בנק (12 חודשים)',
    description: 'תנועות בנק אחרונות לצורך התאמות ובניית תמונה פיננסית מדויקת.',
  },
  {
    icon: FolderOpen,
    title: 'חשבוניות והסכמים',
    description: 'חשבוניות ספקים ולקוחות, חוזי שכירות, הסכמי עבודה — כל מה שרלוונטי.',
  },
] as const

type TrustModuleProps = {
  /** Show/hide the "how it works" steps (already on homepage ProcessSection) */
  showProcess?: boolean
  /** Show/hide the "what to prepare" section */
  showPrepare?: boolean
  /** Show/hide the soft CTA at the bottom (hide when page has its own CTA) */
  showCTA?: boolean
}

export function TrustModule({
  showProcess = true,
  showPrepare = true,
  showCTA = true,
}: TrustModuleProps) {
  return (
    <>
      {/* Section 1: How it works */}
      {showProcess && (
        <RevealSection className="bg-surface py-space-9 px-6">
          <div className="max-w-content mx-auto">
            <SectionHeader
              centered
              subtitle="תהליך פשוט ושקוף — מהפנייה הראשונה ועד שירות שוטף."
            >
              איך זה עובד בפועל?
            </SectionHeader>

            <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-space-5 mt-space-8">
              {PROCESS_STEPS.map(({ icon: Icon, title, description }, i) => (
                <RevealItem key={title}>
                  <div className="bg-white rounded-xl border border-border p-space-5 text-center shadow-sm">
                    <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-space-3">
                      <span className="absolute text-caption font-bold text-primary/30 -mt-9 -me-8">
                        {(i + 1).toString().padStart(2, '0')}
                      </span>
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-body font-bold text-primary">{title}</h3>
                    <p className="text-text-secondary text-body-sm mt-2 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </RevealSection>
      )}

      {/* Section 2: Transparency */}
      <RevealSection className="py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <SectionHeader
            centered
            subtitle="אנחנו מאמינים שאמון נבנה על שקיפות מלאה."
          >
            המחויבות שלנו אליכם
          </SectionHeader>

          <RevealGroup className="grid sm:grid-cols-2 gap-space-5 mt-space-8 max-w-narrow mx-auto">
            {PROMISES.map(({ icon: Icon, title, description }) => (
              <RevealItem key={title}>
                <div className="flex items-start gap-space-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-body font-bold text-primary">{title}</h3>
                    <p className="text-text-secondary text-body-sm mt-1 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </RevealSection>

      {/* Section 3: What to prepare */}
      {showPrepare && (
        <RevealSection className="bg-surface py-space-9 px-6">
          <div className="max-w-content mx-auto">
            <SectionHeader
              centered
              subtitle="כדי שנוכל להתחיל לעבוד כמה שיותר מהר — כדאי להכין מראש."
            >
              מה צריך להכין?
            </SectionHeader>

            <RevealGroup className="grid sm:grid-cols-2 gap-space-5 mt-space-8 max-w-narrow mx-auto">
              {DOCS_TO_PREPARE.map(({ icon: Icon, title, description }) => (
                <RevealItem key={title}>
                  <div className="bg-white rounded-xl border border-border p-space-5 flex items-start gap-space-3 shadow-sm">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-body font-bold text-primary">{title}</h3>
                      <p className="text-text-secondary text-body-sm mt-1 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </RevealSection>
      )}

      {/* Soft CTA */}
      {showCTA && (
        <section className="py-space-8 px-6">
          <div className="max-w-narrow mx-auto text-center">
            <p className="text-body-lg text-text-secondary">
              ביטן את ביטן · 03-5174295
            </p>
          </div>
        </section>
      )}
    </>
  )
}
