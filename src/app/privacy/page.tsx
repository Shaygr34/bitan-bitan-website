import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מדיניות פרטיות — ביטן את ביטן רואי חשבון",
  description: "מדיניות הפרטיות של אתר ביטן את ביטן רואי חשבון.",
};

export default function PrivacyPage() {
  return (
    <section className="py-space-9 px-6">
      <div className="max-w-content mx-auto">
        <h1 className="text-primary text-h1 font-bold">מדיניות פרטיות</h1>
        <span className="gold-underline mt-4" />
        <p className="text-text-secondary text-body-lg mt-space-5 max-w-narrow">
          תוכן מדיניות הפרטיות ייבנה בהמשך.
        </p>
      </div>
    </section>
  );
}
