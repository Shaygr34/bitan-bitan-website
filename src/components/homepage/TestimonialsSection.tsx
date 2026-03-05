import Script from 'next/script'

export function TestimonialsSection() {
  return (
    <section className="py-space-9 bg-surface">
      <div className="max-w-content mx-auto px-space-4">
        <Script src="https://static.elfsight.com/platform/platform.js" strategy="lazyOnload" />
        <div
          className="elfsight-app-9586f5d7-7800-434e-b391-f1b28506fcf2"
          data-elfsight-app-lazy
        />
      </div>
    </section>
  )
}
