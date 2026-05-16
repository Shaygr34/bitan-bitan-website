'use client'

import { useState } from 'react'
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

type Surface = 'card' | 'strip'

type Props = {
  surface?: Surface
}

export function NewsletterSignup({ surface = 'card' }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setErrorMsg('נא להזין כתובת דוא"ל')
      setStatus('error')
      return
    }

    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.error || 'שגיאה בהרשמה')
        setStatus('error')
        return
      }

      setStatus('success')
      setEmail('')
    } catch {
      setErrorMsg('שגיאה בהרשמה. נסו שוב.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    const successContainer =
      surface === 'strip'
        ? 'flex items-center justify-center gap-3 py-space-4 text-center'
        : 'bg-surface border border-border rounded-xl p-space-5 text-center'
    return (
      <div className={successContainer}>
        <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
        <div>
          <p className="text-body font-semibold text-primary">תודה! נרשמתם בהצלחה.</p>
          <p className="text-body-sm text-text-secondary mt-1">
            נשלח לכם עדכון כשנפרסם מאמר חדש או עדכון מיסוי דחוף.
          </p>
        </div>
      </div>
    )
  }

  const wrapperClass =
    surface === 'strip'
      ? 'w-full'
      : 'bg-surface border border-border rounded-xl p-space-5'

  return (
    <div className={wrapperClass}>
      <form onSubmit={handleSubmit} className="space-y-space-3">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-gold shrink-0" />
          <h3 className="text-body-lg font-bold text-primary">
            רוצים לקבל מאמרים חדשים ועדכוני מיסוי דחופים?
          </h3>
        </div>
        <p className="text-body-sm text-text-secondary">
          {'נשלח אליכם מייל כשנפרסם משהו חדש — מאמר מקצועי או עדכון רגולציה שמשפיע עליכם. בלי הצפה.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.co.il"
            dir="ltr"
            aria-label="כתובת דוא״ל"
            className="flex-1 px-4 py-2.5 border border-border rounded-lg text-body text-primary bg-white placeholder:text-text-muted focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-start"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gold text-primary font-bold text-body rounded-lg hover:bg-gold-hover transition-colors cursor-pointer disabled:opacity-60"
          >
            {status === 'sending' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                שולח...
              </>
            ) : (
              'הרשמו'
            )}
          </button>
        </div>

        {status === 'error' && errorMsg && (
          <p className="text-caption text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errorMsg}
          </p>
        )}

        <p className="text-caption text-text-muted">
          {'ניתן להסיר את עצמכם בכל עת. אנחנו לא משתפים את הכתובת עם אף אחד.'}
        </p>
      </form>
    </div>
  )
}
