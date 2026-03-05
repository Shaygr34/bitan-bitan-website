'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-space-9">
      <div className="text-center max-w-narrow">
        <p className="text-[6rem] font-bold text-primary/10 leading-none select-none">
          שגיאה
        </p>
        <h1 className="text-h2 font-bold text-primary mt-2">
          משהו השתבש
        </h1>
        <span className="gold-underline mt-3 mx-auto" />
        <p className="text-body-lg text-text-secondary mt-space-5">
          אירעה שגיאה בטעינת הדף. נסו לרענן או לחזור לדף הבית.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-space-7">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 bg-primary text-white font-bold text-body px-6 py-3 rounded-lg hover:bg-primary-light transition-colors cursor-pointer"
          >
            <RefreshCw className="h-5 w-5" />
            נסו שוב
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border-2 border-primary text-primary font-bold text-body px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            <Home className="h-5 w-5" />
            לדף הבית
          </Link>
        </div>
      </div>
    </div>
  )
}
