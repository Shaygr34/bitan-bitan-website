import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "צור קשר — ביטן את ביטן רואי חשבון",
  description:
    "צרו קשר עם משרד רואי חשבון ביטן את ביטן — טלפון, דוא״ל, וואטסאפ או ביקור במשרד בתל אביב.",
};

export default function ContactPage() {
  return (
    <section className="py-space-9 px-6">
      <div className="max-w-content mx-auto">
        <h1 className="text-primary text-h1 font-bold">צור קשר</h1>
        <span className="gold-underline mt-4" />
        <p className="text-text-secondary text-body-lg mt-space-5 max-w-narrow">
          תוכן עמוד צור קשר ייבנה בהמשך.
        </p>
      </div>
    </section>
  );
}
