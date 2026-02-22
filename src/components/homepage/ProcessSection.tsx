import { SectionHeader } from '@/components/ui'

const STEPS = [
  {
    number: '01',
    title: 'פגישת היכרות',
    description: 'שיחה ראשונית להבנת הצרכים, המטרות והמצב הפיננסי הנוכחי.',
  },
  {
    number: '02',
    title: 'תכנון אסטרטגיה',
    description: 'בניית תוכנית עבודה מותאמת אישית — מס, חשבונאות וליווי עסקי.',
  },
  {
    number: '03',
    title: 'ביצוע מקצועי',
    description: 'יישום מדויק ומקצועי של התוכנית, עם דיווח שוטף ושקיפות מלאה.',
  },
  {
    number: '04',
    title: 'ליווי שוטף',
    description: 'מענה מהיר, עדכונים בזמן אמת ותמיכה מתמשכת בכל שלב בדרך.',
  },
] as const

export function ProcessSection() {
  return (
    <section className="py-space-9 px-6">
      <div className="max-w-content mx-auto">
        <SectionHeader
          centered
          subtitle="תהליך עבודה מסודר ושקוף — מפגישת ההיכרות ועד ליווי שוטף."
        >
          איך אנחנו עובדים?
        </SectionHeader>

        <div className="grid md:grid-cols-4 gap-space-5 mt-space-8">
          {STEPS.map(({ number, title, description }) => (
            <div key={number} className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-space-4">
                <span className="text-white font-bold text-h4">{number}</span>
              </div>
              <h3 className="text-h4 font-semibold text-primary">{title}</h3>
              <p className="text-text-secondary text-body mt-2">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
