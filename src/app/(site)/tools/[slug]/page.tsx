import { notFound } from 'next/navigation'
import { getToolBySlug } from '@/sanity/queries'
import { PortableText } from 'next-sanity'
import { Breadcrumb } from '@/components/Breadcrumb'
import { AlertTriangle } from 'lucide-react'
import { LeasingSimulator } from '@/components/tools/LeasingSimulator'
import type { LeasingConfig } from '@/components/tools/leasing-logic'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const tool = await getToolBySlug(slug)
  if (!tool) return { title: 'כלי לא נמצא' }
  return {
    title: tool.seoTitle || tool.title,
    description: tool.seoDescription || tool.excerpt || '',
    alternates: { canonical: `/tools/${slug}` },
  }
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params
  const tool = await getToolBySlug(slug)
  if (!tool) notFound()

  // Parse CMS config, fallback to defaults
  let parsedConfig: LeasingConfig | undefined
  if (tool.configJson) {
    try {
      parsedConfig = JSON.parse(tool.configJson)
    } catch {
      /* use default */
    }
  }

  // Map toolType to component
  const isLeasing = tool.toolType === 'leasing-simulator'

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6">
        <div className="max-w-content mx-auto hero-animate">
          <div className="mb-space-4 [&_a]:text-white/60 [&_a:hover]:text-white [&_span]:text-white/80 [&_svg]:text-white/40">
            <Breadcrumb items={[{ label: 'כלים', href: '/tools' }, { label: tool.title }]} />
          </div>
          <h1 className="text-white text-h1 font-bold mt-space-4">{tool.title}</h1>
          <span className="gold-underline mt-4" />
          {tool.excerpt && (
            <p className="text-white/85 text-body-lg mt-space-5 max-w-narrow">{tool.excerpt}</p>
          )}
        </div>
      </section>

      {/* Tool */}
      <section className="py-space-9 px-6">
        <div className="max-w-narrow mx-auto">
          {isLeasing && <LeasingSimulator config={parsedConfig} />}
        </div>
      </section>

      {/* SEO Content */}
      {tool.introBody && tool.introBody.length > 0 && (
        <section className="bg-surface py-space-9 px-6">
          <div className="max-w-narrow mx-auto prose prose-lg max-w-none text-text-secondary leading-relaxed space-y-4 [&_h2]:text-h3 [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mt-space-8 [&_h2]:mb-space-4 [&_h3]:text-h4 [&_h3]:font-semibold [&_h3]:text-primary [&_h3]:mt-space-6 [&_h3]:mb-space-3 [&_ul]:space-y-2 [&_ul]:ps-5 [&_li]:text-body [&_strong]:text-primary [&_a]:text-gold [&_a]:hover:text-gold-hover [&_blockquote]:border-s-4 [&_blockquote]:border-gold [&_blockquote]:ps-space-4 [&_blockquote]:italic [&_blockquote]:text-text-muted">
            <PortableText
              value={tool.introBody}
              components={{
                marks: {
                  link: ({ children, value }) => {
                    const href = value?.href || ''
                    const isExternal =
                      href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')
                    return (
                      <a
                        href={href}
                        {...(isExternal || value?.openInNewTab
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        className="text-gold underline hover:text-gold-hover transition-colors"
                      >
                        {children}
                      </a>
                    )
                  },
                  textColor: ({ children, value }) => {
                    const colorMap: Record<string, string> = {
                      red: 'text-red-600',
                      gold: 'text-[#C5A572]',
                      blue: 'text-blue-600',
                      green: 'text-green-600',
                    }
                    return <span className={colorMap[value?.color] || ''}>{children}</span>
                  },
                },
              }}
            />
          </div>
        </section>
      )}

      {/* Disclaimer */}
      {tool.disclaimer && (
        <section className="px-6 pb-space-9">
          <div className="max-w-narrow mx-auto">
            <div className="flex items-start gap-3 bg-surface rounded-lg p-space-4">
              <AlertTriangle className="h-5 w-5 text-text-muted shrink-0 mt-0.5" />
              <p className="text-caption text-text-muted leading-relaxed">{tool.disclaimer}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
