import type { Metadata } from "next";
import Link from "next/link";
import {
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  WhatsAppCTA,
  PhoneCTA,
  Accordion,
  AccordionItem,
} from "@/components/ui";
import {
  Calculator,
  BookOpen,
  FileText,
  Shield,
  Briefcase,
  Globe,
  Users,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { getServices } from "@/sanity/queries";
import { PortableText } from "next-sanity";
import type { Service } from "@/sanity/types";
import { TrustModule } from "@/components/TrustModule";
import { warnFallback } from "@/lib/fallback-warning";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: 'השירותים שלנו',
  description:
    'שירותי ראיית חשבון, ייעוץ מס, הנהלת חשבונות, דוחות כספיים, ביקורת, ליווי עסקי ומיסוי בינלאומי — ביטן את ביטן.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'השירותים שלנו — ביטן את ביטן רואי חשבון',
    description:
      'שירותי ראיית חשבון, ייעוץ מס, הנהלת חשבונות, דוחות כספיים, ביקורת וליווי עסקי.',
  },
};

const ICON_MAP: Record<string, LucideIcon> = {
  calculator: Calculator,
  ledger: BookOpen,
  bookopen: BookOpen,
  chart: FileText,
  filetext: FileText,
  shield: Shield,
  briefcase: Briefcase,
  globe: Globe,
  users: Users,
};

const FALLBACK_SERVICES = [
  { icon: Calculator, title: "ייעוץ מס", description: "תכנון מס אסטרטגי ליחידים, חברות ועסקים — חיסכון מקסימלי במסגרת החוק.", details: ["תכנון מס שנתי ורב-שנתי", "ייעוץ בעסקאות מורכבות", "תכנון מס לפני מכירת נכסים או עסק", "ייצוג מול רשויות המס", "החזרי מס לשכירים"] },
  { icon: BookOpen, title: "הנהלת חשבונות", description: "ניהול ספרים מדויק ומקצועי, דיווחים תקופתיים ועמידה בדרישות רשויות המס.", details: ["הנהלת חשבונות חד-צידית ודו-צידית", "דיווחים חודשיים למע\"מ ומס הכנסה", "ניהול חשבוניות ותשלומים", "התאמות בנקים", "הכנת דוחות ניהוליים שוטפים"] },
  { icon: FileText, title: "דוחות כספיים", description: "הכנת דוחות כספיים שנתיות, דוחות מס הכנסה ודוחות מיוחדים בהתאם לתקנים.", details: ["דוחות כספיים שנתיים מבוקרים וסקורים", "דוחות מס הכנסה ליחידים ולחברות", "דוחות לבנקים ולגופים מוסדיים", "דוחות מיוחדים לפי דרישה"] },
  { icon: Shield, title: "ביקורת חשבונות", description: "שירותי ביקורת מקצועיים להבטחת דיוק ותקינות הדיווח הכספי של העסק.", details: ["ביקורת דוחות כספיים", "ביקורת פנימית", "בדיקת נאותות (Due Diligence)", "חוות דעת מקצועיות"] },
  { icon: Briefcase, title: "ליווי עסקי", description: "ייעוץ עסקי שוטף, תמיכה בקבלת החלטות פיננסיות וליווי בצמתים עסקיים קריטיים.", details: ["הקמת עסק חדש — בחירת מבנה משפטי ומס", "תוכנית עסקית ותחזוקות פיננסיות", "ליווי בגיוסי הון ומימון", "ייעוץ לפני ובמהלך עסקאות", "ייעוץ לשיפור רווחיות"] },
  { icon: Globe, title: "מיסוי בינלאומי", description: "פתרונות מס לפעילות בינלאומית, אמנות מס, ומיסוי תושבי חוץ.", details: ["אמנות למניעת כפל מס", "מיסוי עולים חדשים ותושבים חוזרים", "מבנים בינלאומיים לחברות", "דיווחים לרשויות מס בחו\"ל"] },
  { icon: Users, title: "שכר ותנאים סוציאליים", description: "ניהול שכר מקיף, חישובי פנסיה וביטוח לאומי, והתאמה לדרישות החוק.", details: ["הפקת תלושי שכר", "דיווחים לביטוח לאומי ומס הכנסה", "חישובי פיצויים וזכויות עובדים", "ייעוץ בנושאי דיני עבודה"] },
] as const;

function ServiceCard({ service }: { service: Service }) {
  const Icon = (service.icon && ICON_MAP[service.icon.toLowerCase()]) || Briefcase;
  const slug = service.slug?.current ?? '';
  return (
    <Link href={slug ? `/services/${slug}` : '/contact'}>
      <Card id={slug ? `service-${slug}` : undefined}>
        <CardHeader>
          <div className="flex items-center gap-space-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-h3 font-bold text-primary">{service.title}</h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-text-secondary text-body">
            {service.shortDescription}
          </p>
        </CardBody>
        <CardFooter>
          <span className="inline-flex items-center gap-1 text-body-sm font-medium text-gold hover:text-gold-hover transition-colors">
            פרטים נוספים
            <ArrowLeft className="h-4 w-4" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

export default async function ServicesPage() {
  const services = await getServices();
  const hasData = services && services.length > 0;
  if (!hasData) warnFallback('ServicesPage');

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <div className="mb-space-4 [&_a]:text-white/60 [&_a:hover]:text-white [&_span]:text-white/80 [&_svg]:text-white/40">
            <Breadcrumb items={[{ label: 'שירותים' }]} />
          </div>
          <h1 className="text-white text-h1 font-bold">השירותים שלנו</h1>
          <span className="gold-underline mt-4" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow">
            מגוון שירותים פיננסיים מקיפים תחת קורת גג אחת — מותאמים לצרכים
            הייחודיים של כל לקוח.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <div className="grid md:grid-cols-2 gap-space-6">
            {hasData
              ? services.map((svc) => <ServiceCard key={svc._id} service={svc} />)
              : FALLBACK_SERVICES.map(({ icon: Icon, title, description, details }) => (
                  <Card key={title} hover={false}>
                    <CardHeader>
                      <div className="flex items-center gap-space-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-h3 font-bold text-primary">{title}</h2>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <p className="text-text-secondary text-body mb-space-4">{description}</p>
                      <ul className="space-y-2">
                        {details.map((detail) => (
                          <li key={detail} className="flex items-start gap-2 text-body-sm text-text-secondary">
                            <span className="text-gold mt-1 shrink-0">●</span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-surface py-space-9 px-6">
        <div className="max-w-content mx-auto">
          <SectionHeader centered subtitle="תהליך פשוט ושקוף — מהפנייה הראשונה ועד שירות שוטף.">
            איך מתחילים?
          </SectionHeader>

          <div className="max-w-narrow mx-auto mt-space-8">
            <Accordion>
              <AccordionItem title="1. פנייה ראשונית" defaultOpen>
                צרו קשר בטלפון, בוואטסאפ או דרך האתר. נקבע פגישת היכרות בהתאם
                לזמינות שלכם — אפשר גם בווידאו.
              </AccordionItem>
              <AccordionItem title="2. פגישת היכרות (ללא עלות)">
                נכיר את העסק, נבין את הצרכים ונציג את השירותים הרלוונטיים. נענה
                על כל שאלה ונציג הצעת מחיר שקופה.
              </AccordionItem>
              <AccordionItem title="3. התחלת עבודה">
                לאחר אישור, נתחיל בתהליך קליטה מסודר — העברת מסמכים, הגדרת
                גישות למערכות, ותיאום ציפיות.
              </AccordionItem>
              <AccordionItem title="4. שירות שוטף וליווי">
                מענה מהיר, דיווחים בזמן, עדכונים יזומים על שינויים ברגולציה,
                ותמיכה מתמשכת לאורך כל הדרך.
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Trust Module */}
      <TrustModule showProcess={false} />

      {/* CTA */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto text-center">
          <h2 className="text-white text-h2 font-bold">
            צריכים שירות מקצועי?
          </h2>
          <span className="gold-underline mt-3 mx-auto" />
          <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow mx-auto">
            נשמח לשמוע על העסק שלכם ולהתאים חבילת שירות מותאמת.
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
  );
}
