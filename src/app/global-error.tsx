'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="he" dir="rtl">
      <body style={{ fontFamily: 'Heebo, Arial, sans-serif', margin: 0 }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div>
            <h1 style={{ fontSize: '2rem', color: '#1B2A4A', fontWeight: 700 }}>
              שגיאה כללית
            </h1>
            <p style={{ fontSize: '1.125rem', color: '#64748B', marginTop: '1rem' }}>
              אירעה שגיאה בלתי צפויה. נסו לרענן את הדף.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: '2rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1B2A4A',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              נסו שוב
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
