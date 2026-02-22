const STATS = [
  { value: '30+', label: 'שנות ניסיון' },
  { value: 'דור שני', label: 'של רואי חשבון' },
  { value: '500+', label: 'לקוחות מרוצים' },
  { value: '100%', label: 'מחויבות אישית' },
] as const

export function TrustBar() {
  return (
    <section className="bg-surface py-space-7 px-6 border-b border-border-light">
      <div className="max-w-content mx-auto grid grid-cols-2 md:grid-cols-4 gap-space-5 text-center">
        {STATS.map(({ value, label }) => (
          <div key={label}>
            <p className="text-h2 font-bold text-gold" dir="auto">
              {value}
            </p>
            <p className="text-body text-text-secondary mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
