'use client'

import { useState, type FormEvent } from 'react'
import { Card, CardBody } from '@/components/ui'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { trackFormSubmit } from '@/lib/analytics'

type FieldErrors = {
  name?: string
  phone?: string
  email?: string
}

function validate(data: FormData): FieldErrors {
  const errors: FieldErrors = {}
  const name = (data.get('name') as string)?.trim()
  const phone = (data.get('phone') as string)?.trim()
  const email = (data.get('email') as string)?.trim()

  if (!name || name.length < 2) {
    errors.name = 'נא להזין שם מלא'
  }
  if (!phone || !/^[\d\-+() ]{7,}$/.test(phone)) {
    errors.phone = 'נא להזין מספר טלפון תקין'
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = 'נא להזין כתובת דוא"ל תקינה'
  }

  return errors
}

export function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    // Honeypot — if filled, silently "succeed"
    if ((data.get('website') as string)?.trim()) {
      setStatus('success')
      return
    }

    const fieldErrors = validate(data)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setStatus('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: (data.get('name') as string).trim(),
          phone: (data.get('phone') as string).trim(),
          email: (data.get('email') as string)?.trim() || undefined,
          message: (data.get('message') as string)?.trim() || undefined,
          website: (data.get('website') as string)?.trim() || undefined,
        }),
      })

      if (!res.ok) throw new Error('Failed')

      trackFormSubmit()
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <Card hover={false}>
        <CardBody className="text-center py-space-8">
          <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-space-4" />
          <h3 className="text-h3 font-bold text-primary mb-2">
            תודה! הפנייה התקבלה
          </h3>
          <p className="text-text-secondary text-body">
            נחזור אליכם תוך יום עסקים אחד.
          </p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-space-5 text-body-sm font-medium text-gold hover:text-gold-hover transition-colors cursor-pointer"
          >
            שליחת פנייה נוספת
          </button>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card hover={false}>
      <CardBody>
        <h3 className="text-h3 font-bold text-primary mb-space-5">
          פנייה למשרד
        </h3>

        {status === 'error' && (
          <div role="alert" className="mb-space-4 p-space-3 bg-red-50 border border-red-200 rounded-lg text-body-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            שגיאה בשליחת הטופס. נסו שוב או צרו קשר בטלפון.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-space-4">
          {/* Honeypot — hidden from real users */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="website">
              אל תמלאו שדה זה
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-body-sm font-medium text-primary mb-1"
            >
              שם מלא <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={[
                'w-full px-4 py-3 border rounded-lg text-body text-primary bg-white placeholder:text-text-muted focus:ring-1 transition-colors',
                errors.name
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                  : 'border-border focus:border-gold focus:ring-gold',
              ].join(' ')}
              placeholder="הכניסו את שמכם"
              onChange={() => errors.name && setErrors((prev) => ({ ...prev, name: undefined }))}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="mt-1 text-caption text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-body-sm font-medium text-primary mb-1"
            >
              טלפון <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              dir="ltr"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className={[
                'w-full px-4 py-3 border rounded-lg text-body text-primary bg-white placeholder:text-text-muted focus:ring-1 transition-colors text-start',
                errors.phone
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                  : 'border-border focus:border-gold focus:ring-gold',
              ].join(' ')}
              placeholder="050-000-0000"
              onChange={() => errors.phone && setErrors((prev) => ({ ...prev, phone: undefined }))}
            />
            {errors.phone && (
              <p id="phone-error" role="alert" className="mt-1 text-caption text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-body-sm font-medium text-primary mb-1"
            >
              דוא&quot;ל
            </label>
            <input
              type="email"
              id="email"
              name="email"
              dir="ltr"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={[
                'w-full px-4 py-3 border rounded-lg text-body text-primary bg-white placeholder:text-text-muted focus:ring-1 transition-colors text-start',
                errors.email
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                  : 'border-border focus:border-gold focus:ring-gold',
              ].join(' ')}
              placeholder="name@example.co.il"
              onChange={() => errors.email && setErrors((prev) => ({ ...prev, email: undefined }))}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1 text-caption text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-body-sm font-medium text-primary mb-1"
            >
              הודעה
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="w-full px-4 py-3 border border-border rounded-lg text-body text-primary bg-white placeholder:text-text-muted focus:border-gold focus:ring-1 focus:ring-gold transition-colors resize-none"
              placeholder="ספרו לנו כיצד נוכל לעזור..."
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full inline-flex items-center justify-center gap-2 bg-gold text-primary font-bold text-body py-3 rounded-lg hover:bg-gold-hover hover:scale-[1.03] active:scale-[0.97] transition-all duration-base cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
          >
            {status === 'sending' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                שולח...
              </>
            ) : (
              'שליחה'
            )}
          </button>
          <p className="text-text-muted text-caption text-center">
            נחזור אליכם תוך יום עסקים אחד.
          </p>
        </form>
      </CardBody>
    </Card>
  )
}
