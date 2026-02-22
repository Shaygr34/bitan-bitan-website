/**
 * Footer placeholder — M1 scaffold.
 * Full footer with contact info, nav links, legal links,
 * and copyright will be implemented in M4.
 */
export function Footer() {
  return (
    <footer className="bg-white border-t border-border py-space-7">
      <div className="max-w-content mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Firm name */}
          <div>
            <p className="text-primary font-bold text-body-lg">
              ביטן את ביטן — רואי חשבון
            </p>
            <p className="text-text-muted text-body-sm mt-1">
              הרכבת 58, מגדל אלקטרה סיטי, קומה 11, תל אביב
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col md:items-end gap-1 text-body-sm">
            <a
              href="tel:03-5174295"
              className="text-primary hover:text-primary-light transition-colors"
              dir="ltr"
            >
              03-5174295
            </a>
            <a
              href="https://wa.me/972527221111"
              className="text-primary hover:text-primary-light transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-space-5 pt-space-4 border-t border-border-light text-text-muted text-caption">
          <p>
            © {new Date().getFullYear()} ביטן את ביטן — רואי חשבון. כל הזכויות
            שמורות.
          </p>
          <p className="mt-1">
            המידע באתר הינו כללי בלבד ואינו מהווה תחליף לייעוץ מקצועי פרטני.
          </p>
        </div>
      </div>
    </footer>
  );
}
