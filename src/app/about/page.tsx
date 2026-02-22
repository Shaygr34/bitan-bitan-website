import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "אודות — ביטן את ביטן רואי חשבון",
  description:
    "הכירו את משרד רואי חשבון ביטן את ביטן — דור שני של מומחיות פיננסית בתל אביב.",
};

export default function AboutPage() {
  return (
    <section className="py-space-9 px-6">
      <div className="max-w-content mx-auto">
        <h1 className="text-primary text-h1 font-bold">אודות</h1>
        <span className="gold-underline mt-4" />
        <p className="text-text-secondary text-body-lg mt-space-5 max-w-narrow">
          תוכן עמוד האודות ייבנה בהמשך.
        </p>
      </div>
    </section>
  );
}
