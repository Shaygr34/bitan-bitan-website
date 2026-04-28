import { notFound } from 'next/navigation'
import { getToolBySlug, getTaxConfig } from '@/sanity/queries'
import type { TaxConfig } from '@/sanity/queries'
import { PortableText } from 'next-sanity'
import { Breadcrumb } from '@/components/Breadcrumb'
import { AlertTriangle } from 'lucide-react'
import { LeasingCalculator } from '@/components/tools/calculator/LeasingCalculator'
import { EmployerCalculator } from '@/components/tools/employer/EmployerCalculator'
import type { CalculatorConfig } from '@/components/tools/calculator/types'
import type { EmployerCalcConfig } from '@/components/tools/employer/types'

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
  const [tool, taxConfig] = await Promise.all([getToolBySlug(slug), getTaxConfig()])
  if (!tool) notFound()

  const isLeasing = tool.toolType === 'leasing-simulator'
  const isEmployer = tool.toolType === 'employer-cost-calculator'

  // Build leasing config from tax config singleton + tool-level overrides
  const calcConfig: Partial<CalculatorConfig> = {}
  if (taxConfig?.primeRate) calcConfig.primeRate = taxConfig.primeRate
  if (taxConfig?.vatRate) calcConfig.vatRate = taxConfig.vatRate / 100
  // Tool-level fields override singleton (backwards compat)
  if (tool.primeRate) calcConfig.primeRate = tool.primeRate
  if (tool.vatRate) calcConfig.vatRate = tool.vatRate / 100

  // Build employer config from tax config singleton
  const employerConfig: Partial<EmployerCalcConfig> = {}
  if (taxConfig) {
    const tc = taxConfig
    // Tax brackets — convert from CMS format (rate as %, annual ceiling) to engine format (rate as decimal, monthly upTo)
    if (tc.taxBrackets?.length) {
      employerConfig.taxBrackets = tc.taxBrackets.map(b => ({
        upTo: b.ceiling ? Math.round(b.ceiling / 12) : Infinity,
        rate: b.rate / 100,
      }))
    }
    if (tc.niiLowThreshold) employerConfig.niiLowThreshold = tc.niiLowThreshold
    if (tc.niiHighThreshold) employerConfig.niiHighThreshold = tc.niiHighThreshold
    if (tc.niiEmployeeLow) employerConfig.niiEmployeeLow = tc.niiEmployeeLow / 100
    if (tc.niiEmployeeHigh) employerConfig.niiEmployeeHigh = tc.niiEmployeeHigh / 100
    if (tc.niiEmployerLow) employerConfig.niiEmployerLow = tc.niiEmployerLow / 100
    if (tc.niiEmployerHigh) employerConfig.niiEmployerHigh = tc.niiEmployerHigh / 100
    if (tc.creditPointValue) employerConfig.creditPointValue = tc.creditPointValue
    if (tc.avgSalary) employerConfig.avgSalary = tc.avgSalary
    if (tc.severanceCap) employerConfig.severanceCap = tc.severanceCap
    if (tc.educationFundCap) employerConfig.educationFundCap = tc.educationFundCap
    if (tc.vehicleTaxRate) employerConfig.vehicleTaxRate = tc.vehicleTaxRate / 100
    if (tc.manufacturerPriceCap) employerConfig.manufacturerPriceCap = tc.manufacturerPriceCap
    if (tc.electricReduction) employerConfig.electricReduction = tc.electricReduction
    if (tc.plugInReduction) employerConfig.plugInReduction = tc.plugInReduction
    if (tc.hybridReduction) employerConfig.hybridReduction = tc.hybridReduction
    if (tc.surchargeThreshold) employerConfig.surchargeThreshold = tc.surchargeThreshold
    if (tc.pensionCreditSalaryCap) employerConfig.pensionCreditSalaryCap = tc.pensionCreditSalaryCap
    if (tc.pensionCreditRate) employerConfig.pensionCreditRate = tc.pensionCreditRate / 100
    if (tc.pensionCreditTaxRate) employerConfig.pensionCreditTaxRate = tc.pensionCreditTaxRate / 100
    if (tc.defaultTravelAllowance) employerConfig.defaultTravelAllowance = tc.defaultTravelAllowance
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-space-9 px-6 print:hidden">
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
          {isLeasing && <LeasingCalculator config={calcConfig} />}
          {isEmployer && <EmployerCalculator config={employerConfig} />}
        </div>
      </section>

      {/* SEO Content */}
      {tool.introBody && tool.introBody.length > 0 && (
        <section className="bg-surface py-space-9 px-6 print:hidden">
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
        <section className="px-6 pb-space-9 print:hidden">
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
