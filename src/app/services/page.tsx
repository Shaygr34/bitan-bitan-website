import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "שירותים — ביטן את ביטן רואי חשבון",
  description:
    "שירותי ראיית חשבון, ייעוץ מס, הנהלת חשבונות ודוחות כספיים — ביטן את ביטן.",
};

export default function ServicesPage() {
  return (
    <section className="py-space-9 px-6">
      <div className="max-w-content mx-auto">
        <h1 className="text-primary text-h1 font-bold">שירותים</h1>
        <span className="gold-underline mt-4" />
        <p className="text-text-secondary text-body-lg mt-space-5 max-w-narrow">
          תוכן עמוד השירותים ייבנה בהמשך.
        </p>
      </div>
    </section>
  );
}
