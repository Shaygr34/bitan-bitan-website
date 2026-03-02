import Link from 'next/link'
import type { Metadata } from 'next'
import { Home, Search, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'הדף לא נמצא',
}

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-space-9">
      <div className="text-center max-w-narrow">
        <p className="text-[8rem] font-bold text-primary/10 leading-none select-none">
          404
        </p>
        <h1 className="text-h2 font-bold text-primary -mt-6">
          הדף לא נמצא
        </h1>
        <span className="gold-underline mt-3 mx-auto" />
        <p className="text-body-lg text-text-secondary mt-space-5">
          הדף שחיפשתם לא קיים, הועבר או הוסר.
          <br />
          אפשר לנסות אחת מהאפשרויות הבאות:
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-space-7">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold text-body px-6 py-3 rounded-lg hover:bg-primary-light transition-colors"
          >
            <Home className="h-5 w-5" />
            לדף הבית
          </Link>
          <Link
            href="/knowledge"
            className="inline-flex items-center gap-2 border-2 border-primary text-primary font-bold text-body px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            <Search className="h-5 w-5" />
            מרכז הידע
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border-2 border-gold text-gold font-bold text-body px-6 py-3 rounded-lg hover:bg-gold hover:text-primary transition-colors"
          >
            <Phone className="h-5 w-5" />
            צור קשר
          </Link>
        </div>
      </div>
    </div>
  )
}
