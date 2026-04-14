'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, ChevronDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

type Category = { _id: string; title: string }

type Props = {
  categories: Category[]
  preSelectedCategoryId?: string
  compact?: boolean
}

export function NewsletterSignup({ categories, preSelectedCategoryId, compact = false }: Props) {
  const [expanded, setExpanded] = useState(!compact)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    preSelectedCategoryId
      ? new Set([preSelectedCategoryId])
      : new Set(categories.map((c) => c._id))
  )
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || selectedIds.size === 0) {
      setErrorMsg(!email ? 'נא להזין כתובת דוא"ל' : 'נא לבחור לפחות נושא אחד')
      setStatus('error')
      return
    }

    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          categoryIds: Array.from(selectedIds),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setErrorMsg(data.error || 'שגיאה בהרשמה')
        setStatus('error')
        return
      }

      setStatus('success')
    } catch {
      setErrorMsg('שגיאה בהרשמה. נסו שוב.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-surface border border-border rounded-xl p-space-5 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-space-3" />
        <p className="text-body font-semibold text-primary">נרשמתם בהצלחה!</p>
        <p className="text-body-sm text-text-secondary mt-1">תקבלו עדכונים בנושאים שבחרתם.</p>
      </div>
    )
  }

  const preSelectedCategory = preSelectedCategoryId
    ? categories.find((c) => c._id === preSelectedCategoryId)
    : null

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header / Compact trigger */}
      {compact ? (
        <form onSubmit={handleSubmit} className="p-space-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <Mail className="h-5 w-5 text-gold" />
              <span className="text-body font-semibold text-primary">הרשמו לעדכונים</span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.co.il"
              dir="ltr"
              className="flex-1 px-4 py-2 border border-border rounded-lg text-body text-primary bg-white placeholder:text-text-muted focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-start"
            />
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-body-sm font-medium text-gold-dark hover:text-gold transition-colors cursor-pointer"
            >
              בחרו נושאים
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="shrink-0 px-5 py-2 bg-gold text-primary font-bold text-body-sm rounded-lg hover:bg-gold-hover transition-colors cursor-pointer disabled:opacity-60"
            >
              {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'הרשמו'}
            </button>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-space-4 space-y-space-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="שם (לא חובה)"
                    className="w-full sm:w-auto px-4 py-2 border border-border rounded-lg text-body text-primary bg-white placeholder:text-text-muted focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
                  />
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() => toggleCategory(cat._id)}
                        className={[
                          'px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors cursor-pointer',
                          selectedIds.has(cat._id)
                            ? 'bg-primary text-white'
                            : 'bg-white border border-border text-text-secondary hover:border-gold',
                        ].join(' ')}
                      >
                        {cat.title}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {status === 'error' && errorMsg && (
            <p className="mt-space-3 text-caption text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errorMsg}
            </p>
          )}
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="p-space-5 space-y-space-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-gold" />
            <h3 className="text-body-lg font-bold text-primary">
              {preSelectedCategory
                ? `עדכונים בנושא ${preSelectedCategory.title}?`
                : 'הרשמו לעדכונים'}
            </h3>
          </div>
          <p className="text-body-sm text-text-secondary">
            קבלו עדכונים ומאמרים חדשים ישירות למייל.
          </p>

          <div className="space-y-space-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.co.il"
              dir="ltr"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-body text-primary bg-white placeholder:text-text-muted focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-start"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="שם (לא חובה)"
              className="w-full px-4 py-2.5 border border-border rounded-lg text-body text-primary bg-white placeholder:text-text-muted focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
            />

            <div>
              <p className="text-body-sm font-medium text-primary mb-2">נושאים:</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => toggleCategory(cat._id)}
                    className={[
                      'px-3 py-1.5 rounded-full text-body-sm font-medium transition-colors cursor-pointer',
                      selectedIds.has(cat._id)
                        ? 'bg-primary text-white'
                        : 'bg-white border border-border text-text-secondary hover:border-gold',
                    ].join(' ')}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {status === 'error' && errorMsg && (
            <p className="text-caption text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full inline-flex items-center justify-center gap-2 bg-gold text-primary font-bold text-body py-2.5 rounded-lg hover:bg-gold-hover transition-colors cursor-pointer disabled:opacity-60"
          >
            {status === 'sending' ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                שולח...
              </>
            ) : (
              'הרשמו לעדכונים'
            )}
          </button>
        </form>
      )}
    </div>
  )
}
