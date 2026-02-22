import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מרכז ידע — ביטן את ביטן רואי חשבון",
  description:
    "מאמרים, מדריכים ומידע מקצועי בנושאי מס, חשבונאות וניהול פיננסי.",
};

export default function KnowledgePage() {
  return (
    <section className="py-space-9 px-6">
      <div className="max-w-content mx-auto">
        <h1 className="text-primary text-h1 font-bold">מרכז ידע</h1>
        <span className="gold-underline mt-4" />
        <p className="text-text-secondary text-body-lg mt-space-5 max-w-narrow">
          תוכן מרכז הידע ייבנה בהמשך.
        </p>
      </div>
    </section>
  );
}
