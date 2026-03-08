import Script from 'next/script'

export function TestimonialsSection() {
  return (
    <section className="py-space-9 bg-surface">
      <div className="max-w-content mx-auto px-space-4">
        <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
        <div
          className="elfsight-app-ea0db862-4a7e-4c4d-aad5-762b1841ad30"
          data-elfsight-app-lazy
        />
      </div>
    </section>
  )
}
