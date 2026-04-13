'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  CLIENT_TYPE_OPTIONS,
  DOC_FIELDS,
  getDocCategory,
  ONBOARDING_PATHS,
  BUSINESS_SECTORS,
  isTransferPath,
  isCompanyPath,
  type DocField,
  type OnboardingPath,
} from '@/lib/intake-types'
import styles from './intake.module.css'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png'

const STEP_LABELS_FULL = ['סוג לקוח', 'פרטים אישיים', 'פרטי עסק', 'מסמכים', 'סיכום']
const STEP_LABELS_SHORT = ['פרטים אישיים', 'פרטי עסק', 'מסמכים', 'סיכום']

interface FormFields {
  fullName: string
  companyNumber: string
  phone: string
  email: string
  address: string
  city: string
  zipCode: string
  birthdate: string
  // Business fields (new)
  businessName: string
  businessSector: string
  businessAddress: string
  hasEmployees: string // 'yes' | 'no' | ''
  employeeCount: string
  shareholderDetails: string
  // Transfer fields (new)
  previousCpaName: string
  previousCpaEmail: string
  previousCpaSoftware: string
  // Path
  onboardingPath: string
}

const EMPTY_FORM: FormFields = {
  fullName: '',
  companyNumber: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  zipCode: '',
  birthdate: '',
  businessName: '',
  businessSector: '',
  businessAddress: '',
  hasEmployees: '',
  employeeCount: '',
  shareholderDetails: '',
  previousCpaName: '',
  previousCpaEmail: '',
  previousCpaSoftware: '',
  onboardingPath: '',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function IntakeForm({ token, prefillClientType, previousData, summitEntityId, isUpdate }: {
  token: string
  prefillClientType?: string
  previousData?: Record<string, string>
  summitEntityId?: string
  isUpdate?: boolean
}) {
  const skipTypeStep = !!prefillClientType
  const stepLabels = skipTypeStep ? STEP_LABELS_SHORT : STEP_LABELS_FULL
  const totalSteps = stepLabels.length
  // Internal step: 1-based index into stepLabels
  const [step, setStep] = useState(1)
  const [clientType, setClientType] = useState(prefillClientType || previousData?.clientType || '')
  const [formData, setFormData] = useState<FormFields>(() => {
    if (!previousData) return EMPTY_FORM
    // Pre-fill from previous submission
    return {
      ...EMPTY_FORM,
      fullName: previousData.fullName || '',
      companyNumber: previousData.companyNumber || '',
      phone: previousData.phone || '',
      email: previousData.email || '',
      address: previousData.address || '',
      city: previousData.city || '',
      zipCode: previousData.zipCode || '',
      birthdate: previousData.birthdate || '',
      businessName: previousData.businessName || '',
      businessSector: previousData.businessSector || '',
      businessAddress: previousData.businessAddress || '',
      hasEmployees: previousData.hasEmployees || '',
      employeeCount: previousData.employeeCount || '',
      shareholderDetails: previousData.shareholderDetails || '',
      previousCpaName: previousData.previousCpaName || '',
      previousCpaEmail: previousData.previousCpaEmail || '',
      previousCpaSoftware: previousData.previousCpaSoftware || '',
      onboardingPath: previousData.onboardingPath || '',
    }
  })
  const [files, setFiles] = useState<Record<string, File>>({})
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const progressTrackRef = useRef<HTMLDivElement>(null)
  const [fillWidth, setFillWidth] = useState('0%')
  const [showWelcome, setShowWelcome] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

  // -------------------------------------------------------------------------
  // Track "opened" status on mount (fire-and-forget)
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetch('/api/intake/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).catch(() => {})
  }, [token])

  // -------------------------------------------------------------------------
  // localStorage: restore draft on mount
  // -------------------------------------------------------------------------
  const storageKey = `intake_draft_${token}`

  useEffect(() => {
    if (previousData) return
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return
      const draft = JSON.parse(raw)
      // Guard: discard draft if step layout changed (skipTypeStep mismatch)
      if (draft.skipTypeStep !== skipTypeStep) {
        localStorage.removeItem(storageKey)
        return
      }
      if (draft.formData) setFormData(draft.formData)
      if (draft.clientType) setClientType(draft.clientType)
      if (draft.step) setStep(draft.step)
      setShowWelcome(true)
    } catch {
      // localStorage unavailable or corrupted — ignore
    }
  }, []) // eslint-disable-line

  // -------------------------------------------------------------------------
  // localStorage: auto-save on every change (debounced 300ms)
  // Skips mount render to avoid overwriting localStorage with EMPTY_FORM
  // before the restore effect's setFormData has triggered a re-render.
  // -------------------------------------------------------------------------
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstSaveRender = useRef(true)

  useEffect(() => {
    // Skip the first invocation (mount) — restore effect needs to populate state first
    if (isFirstSaveRender.current) {
      isFirstSaveRender.current = false
      return
    }
    if (submitted) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          formData,
          clientType,
          step,
          skipTypeStep,
        }))
      } catch {
        // localStorage full or unavailable — silent fail
      }
    }, 300)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [formData, clientType, step, submitted, storageKey, skipTypeStep])

  // -------------------------------------------------------------------------
  // Progress bar fill calculation (RTL: step 1 is rightmost, fill goes right→left)
  // -------------------------------------------------------------------------
  useEffect(() => {
    function calcFill() {
      const track = progressTrackRef.current
      if (!track) return
      const circles = track.querySelectorAll('[data-step]')
      if (circles.length < 2) return

      const firstCircle = circles[0].getBoundingClientRect()
      if (step <= 1) {
        setFillWidth('0px')
        return
      }
      const targetCircle = circles[step - 1].getBoundingClientRect()
      const width = firstCircle.left + firstCircle.width / 2 - (targetCircle.left + targetCircle.width / 2)
      setFillWidth(`${Math.max(0, width)}px`)
    }

    calcFill()
    window.addEventListener('resize', calcFill)
    return () => window.removeEventListener('resize', calcFill)
  }, [step, prefillClientType])

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const docCategory = clientType ? getDocCategory(clientType) : 'individual'
  const relevantDocs: DocField[] = DOC_FIELDS.filter((d) =>
    d.categories.includes(docCategory),
  )
  const missingRequiredDocs = relevantDocs.filter(d => d.required && !files[d.key])
  const hasMissingDocs = missingRequiredDocs.length > 0

  const updateField = useCallback(
    (key: keyof FormFields, value: string) => {
      setFormData((prev) => ({ ...prev, [key]: value }))
      if (fieldErrors[key]) {
        setFieldErrors((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      }
    },
    [fieldErrors],
  )

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------
  function validateStep2(): boolean {
    const errors: Record<string, string> = {}
    if (!formData.fullName.trim()) errors.fullName = 'שדה חובה'
    if (!formData.companyNumber.trim()) errors.companyNumber = 'שדה חובה'
    if (!formData.phone.trim()) errors.phone = 'שדה חובה'
    if (!formData.email.trim()) {
      errors.email = 'שדה חובה'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'כתובת דוא"ל לא תקינה'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // -------------------------------------------------------------------------
  // File handling
  // -------------------------------------------------------------------------
  function handleFileSelect(key: string, file: File | null) {
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      setFileErrors((prev) => ({
        ...prev,
        [key]: `הקובץ גדול מ-20MB (${formatFileSize(file.size)})`,
      }))
      return
    }
    setFileErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setFiles((prev) => ({ ...prev, [key]: file }))
  }

  function removeFile(key: string) {
    setFiles((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setFileErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  // -------------------------------------------------------------------------
  // Step mapping: display step (1-based) → content type
  // -------------------------------------------------------------------------
  // When skipTypeStep: step 1=details, 2=docs, 3=review
  // Otherwise:        step 1=type, 2=details, 3=docs, 4=review
  function getContentStep(): 'type' | 'details' | 'business' | 'docs' | 'review' {
    if (skipTypeStep) {
      if (step === 1) return 'details'
      if (step === 2) return 'business'
      if (step === 3) return 'docs'
      return 'review'
    }
    if (step === 1) return 'type'
    if (step === 2) return 'details'
    if (step === 3) return 'business'
    if (step === 4) return 'docs'
    return 'review'
  }
  const contentStep = getContentStep()

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  function goNext() {
    if (contentStep === 'details' && !validateStep2()) return
    setShowConfirmSubmit(false)
    setStep((s) => Math.min(s + 1, totalSteps))
  }

  function goBack() {
    setShowConfirmSubmit(false)
    setStep((s) => Math.max(s - 1, 1))
  }

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    try {
      const fd = new FormData()
      fd.append('token', token)
      fd.append('clientType', clientType)
      fd.append('onboardingPath', formData.onboardingPath)
      if (isUpdate && summitEntityId) fd.append('summitEntityId', summitEntityId)
      if (isUpdate) fd.append('isUpdate', 'true')
      fd.append('fullName', formData.fullName.trim())
      fd.append('companyNumber', formData.companyNumber.trim())
      fd.append('phone', formData.phone.trim())
      fd.append('email', formData.email.trim())
      if (formData.address.trim()) fd.append('address', formData.address.trim())
      if (formData.city.trim()) fd.append('city', formData.city.trim())
      if (formData.zipCode.trim()) fd.append('zipCode', formData.zipCode.trim())
      if (formData.birthdate) fd.append('birthdate', formData.birthdate)
      // Business fields
      if (formData.businessName.trim()) fd.append('businessName', formData.businessName.trim())
      if (formData.businessSector.trim()) fd.append('businessSector', formData.businessSector.trim())
      if (formData.businessAddress.trim()) fd.append('businessAddress', formData.businessAddress.trim())
      if (formData.hasEmployees) fd.append('hasEmployees', formData.hasEmployees)
      if (formData.employeeCount) fd.append('employeeCount', formData.employeeCount)
      if (formData.shareholderDetails.trim()) fd.append('shareholderDetails', formData.shareholderDetails.trim())
      // Transfer fields
      if (formData.previousCpaName.trim()) fd.append('previousCpaName', formData.previousCpaName.trim())
      if (formData.previousCpaEmail.trim()) fd.append('previousCpaEmail', formData.previousCpaEmail.trim())
      if (formData.previousCpaSoftware.trim()) fd.append('previousCpaSoftware', formData.previousCpaSoftware.trim())

      for (const [key, file] of Object.entries(files)) {
        fd.append(`file_${key}`, file)
        const docField = DOC_FIELDS.find((d) => d.key === key)
        fd.append(`label_${key}`, docField?.label ?? key)
      }

      const res = await fetch('/api/intake', { method: 'POST', body: fd })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(
          body?.error ?? 'אירעה שגיאה בשליחת הטופס. נסו שוב.',
        )
      }

      // Clear localStorage draft on successful submit
      try { localStorage.removeItem(storageKey) } catch { /* ignore */ }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא צפויה')
    } finally {
      setSubmitting(false)
    }
  }

  // -------------------------------------------------------------------------
  // Success screen
  // -------------------------------------------------------------------------
  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successScreen}>
          <div className={styles.checkmark}>
            <div className={styles.checkmarkIcon} />
          </div>
          <h1 className={styles.successTitle}>
            תודה שהצטרפת למשפחת ביטן!
          </h1>
          <p className={styles.successMessage}>ניצור איתך קשר בקרוב</p>

          <div className={styles.successNextSection}>
            <h2 className={styles.successNextTitle}>מה הלאה?</h2>
            <p className={styles.successNextText}>
              צוות המשרד יצור איתכם קשר בקרוב לאישור הפרטים והמשך תהליך הקליטה.
            </p>
            <a href="tel:+97235174295" className={styles.successPhone}>
              03-5174295
            </a>
          </div>

          <div className={styles.successDivider} />
          <p className={styles.successBrand}>
            ביטן את ביטן — רואי חשבון
          </p>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Progress bar
  // -------------------------------------------------------------------------
  const progressBar = (
    <div className={styles.progressBar}>
      <div className={styles.progressTrack} ref={progressTrackRef}>
        <div className={styles.progressFill} style={{ width: fillWidth }} />
        {stepLabels.map((label, i) => {
          const n = i + 1
          // When client type is pre-filled, step 1 counts as completed even at step 2
          const isCompleted = prefillClientType ? n <= step - 1 : n < step
          const isActive = n === step
          return (
            <div key={n} className={styles.progressStep} data-step={n}>
              <div
                className={
                  isCompleted
                    ? styles.progressCircleCompleted
                    : isActive
                      ? styles.progressCircleActive
                      : styles.progressCircle
                }
              >
                {isCompleted ? (
                  <svg className={styles.checkSvg} viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  n
                )}
              </div>
              {/* Amber badge for missing docs on the מסמכים step */}
              {label === 'מסמכים' && hasMissingDocs && contentStep !== 'docs' && (
                <span className={styles.stepBadge} />
              )}
              <span
                className={
                  isCompleted
                    ? styles.progressLabelCompleted
                    : isActive
                      ? styles.progressLabelActive
                      : styles.progressLabel
                }
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )

  // -------------------------------------------------------------------------
  // Step 1 — Client Type
  // -------------------------------------------------------------------------
  function renderStep1() {
    const selectedPath = formData.onboardingPath as OnboardingPath | ''

    return (
      <>
        {/* Step 1a: Onboarding path */}
        {!selectedPath && (
          <>
            <h2 className={styles.stepTitle}>ברוכים הבאים!</h2>
            <p className={styles.stepSubtitle}>מה מתאר את המצב שלכם?</p>
            <div className={styles.cardGrid}>
              {ONBOARDING_PATHS.map((path) => (
                <button
                  key={path.value}
                  type="button"
                  className={styles.typeCard}
                  onClick={() => updateField('onboardingPath', path.value)}
                >
                  <strong>{path.label}</strong>
                  <br />
                  <span style={{ fontSize: '0.85em', opacity: 0.7 }}>{path.description}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 1b: Client type (after path selected) */}
        {selectedPath && !clientType && (
          <>
            <h2 className={styles.stepTitle}>איזה סוג עסק?</h2>
            <p className={styles.stepSubtitle}>בחרו את הסוג שמתאים לכם</p>
            <div className={styles.cardGrid}>
              {CLIENT_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={styles.typeCard}
                  onClick={() => {
                    setClientType(opt.value)
                    setStep(2)
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className={styles.buttonRow}>
              <button type="button" className={styles.btnSecondary} onClick={() => updateField('onboardingPath', '')}>
                חזרה
              </button>
            </div>
          </>
        )}

        {/* If both selected, auto-advance */}
        {selectedPath && clientType && null}
      </>
    )
  }

  // -------------------------------------------------------------------------
  // Step 2 — Personal Details
  // -------------------------------------------------------------------------
  function renderStep2() {
    const showShareholders = docCategory === 'company'

    return (
      <>
        <h2 className={styles.stepTitle}>ספרו לנו על עצמכם</h2>
        <p className={styles.stepSubtitle}>פרטים בסיסיים כדי שנכיר אתכם</p>

        {renderInput('fullName', 'שם מלא', true)}
        {renderInput('companyNumber', 'ת"ז / ח"פ', true)}
        {renderInput('phone', 'טלפון', true, 'tel')}
        {renderInput('email', 'דוא"ל', true, 'email')}
        {renderInput('address', 'כתובת', false)}
        {renderInput('city', 'יישוב', false)}
        {renderInput('zipCode', 'מיקוד', false)}
        {/* Birthdate — 3 dropdowns instead of native date picker */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>תאריך לידה</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              className={styles.input}
              style={{ flex: 1 }}
              value={formData.birthdate ? formData.birthdate.split('-')[2] || '' : ''}
              onChange={(e) => {
                const [y, m] = (formData.birthdate || '--').split('-')
                updateField('birthdate', `${y || '1990'}-${m || '01'}-${e.target.value.padStart(2, '0')}`)
              }}
            >
              <option value="">יום</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={String(d).padStart(2, '0')}>{d}</option>
              ))}
            </select>
            <select
              className={styles.input}
              style={{ flex: 1.2 }}
              value={formData.birthdate ? formData.birthdate.split('-')[1] || '' : ''}
              onChange={(e) => {
                const [y, , d] = (formData.birthdate || '--').split('-')
                updateField('birthdate', `${y || '1990'}-${e.target.value}-${d || '01'}`)
              }}
            >
              <option value="">חודש</option>
              {['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'].map((name, i) => (
                <option key={i} value={String(i + 1).padStart(2, '0')}>{name}</option>
              ))}
            </select>
            <select
              className={styles.input}
              style={{ flex: 1 }}
              value={formData.birthdate ? formData.birthdate.split('-')[0] || '' : ''}
              onChange={(e) => {
                const [, m, d] = (formData.birthdate || '--').split('-')
                updateField('birthdate', `${e.target.value}-${m || '01'}-${d || '01'}`)
              }}
            >
              <option value="">שנה</option>
              {Array.from({ length: 80 }, (_, i) => 2008 - i).map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        {/* businessSector + shareholders moved to business step */}

        <div className={styles.buttonRow}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={goBack}
          >
            חזרה
          </button>
          <button type="button" className={styles.btnPrimary} onClick={goNext}>
            הבא
          </button>
        </div>
      </>
    )
  }

  // -------------------------------------------------------------------------
  // Step Business — Business details + transfer-specific fields
  // -------------------------------------------------------------------------
  function renderStepBusiness() {
    const path = formData.onboardingPath as OnboardingPath
    const isTransfer = path ? isTransferPath(path) : false
    const isCompany = path ? isCompanyPath(path) : getDocCategory(clientType) === 'company'

    return (
      <>
        <h2 className={styles.stepTitle}>פרטי העסק</h2>
        <p className={styles.stepSubtitle}>
          {isTransfer ? 'פרטים לצורך העברת התיק למשרדנו' : 'פרטים על העסק שלכם'}
        </p>

        {renderInput('businessName', 'שם העסק', true)}

        {/* Business sector — searchable dropdown */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            תחום עיסוק <span className={styles.required}>*</span>
          </label>
          <select
            className={styles.input}
            value={formData.businessSector}
            onChange={(e) => updateField('businessSector', e.target.value)}
          >
            <option value="">בחרו תחום...</option>
            {BUSINESS_SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {renderInput('businessAddress', 'כתובת העסק', false)}

        {/* Employees */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>האם מעסיק עובדים?</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button"
              className={formData.hasEmployees === 'yes' ? styles.typeCardSelected : styles.typeCard}
              style={{ flex: 1, padding: '0.5rem' }}
              onClick={() => updateField('hasEmployees', 'yes')}>
              כן
            </button>
            <button type="button"
              className={formData.hasEmployees === 'no' ? styles.typeCardSelected : styles.typeCard}
              style={{ flex: 1, padding: '0.5rem' }}
              onClick={() => updateField('hasEmployees', 'no')}>
              לא
            </button>
          </div>
        </div>

        {formData.hasEmployees === 'yes' && (
          renderInput('employeeCount', 'כמה עובדים?', false, 'number')
        )}

        {/* Transfer-specific fields */}
        {isTransfer && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f7f4', borderRadius: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1B2A4A', marginBottom: '0.75rem' }}>
              פרטי רו&quot;ח קודם
            </h3>
            {renderInput('previousCpaName', 'שם רו"ח / משרד קודם', true)}
            {renderInput('previousCpaEmail', 'מייל רו"ח קודם', false, 'email')}
            {renderInput('previousCpaSoftware', 'באיזה תוכנות עבד הרו"ח?', false)}
            <p style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.5rem' }}>
              * נשלח מייל לרו&quot;ח הקודם לשחרור תיק והעברת מסמכים
            </p>
          </div>
        )}

        {/* Company shareholders */}
        {isCompany && (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>פרטי בעלי מניות</label>
            <textarea
              className={styles.textarea}
              value={formData.shareholderDetails}
              onChange={(e) => updateField('shareholderDetails', e.target.value)}
              placeholder="שם, ת.ז, אחוז אחזקה..."
            />
          </div>
        )}

        <div className={styles.buttonRow}>
          <button type="button" className={styles.btnSecondary} onClick={goBack}>חזרה</button>
          <button type="button" className={styles.btnPrimary} onClick={goNext}>הבא</button>
        </div>
      </>
    )
  }

  function renderInput(
    key: keyof FormFields,
    label: string,
    required: boolean,
    type: string = 'text',
  ) {
    return (
      <div className={styles.fieldGroup}>
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
        <input
          className={styles.input}
          type={type}
          value={formData[key]}
          onChange={(e) => updateField(key, e.target.value)}
          required={required}
        />
        {fieldErrors[key] && (
          <div className={styles.fieldError}>{fieldErrors[key]}</div>
        )}
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Step 3 — Document Uploads
  // -------------------------------------------------------------------------
  function renderStep3() {
    return (
      <>
        <h2 className={styles.stepTitle}>מסמכים</h2>
        <p className={styles.stepSubtitle}>העלו את המסמכים הנדרשים</p>

        {hasMissingDocs && (
          <div className={styles.warningBanner}>
            <strong>חסרים מסמכים נדרשים:</strong>
            {missingRequiredDocs.map(d => d.label).join(', ')}
          </div>
        )}

        {relevantDocs.map((doc) => (
          <div key={doc.key} className={styles.fieldGroup}>
            <label className={styles.label}>
              {doc.label}
              {doc.required && <span className={styles.required}>*</span>}
            </label>

            {files[doc.key] ? (
              <div className={styles.filePreview}>
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>
                    {files[doc.key].name}
                  </span>
                  <span className={styles.fileSize}>
                    ({formatFileSize(files[doc.key].size)})
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeFile(doc.key)}
                  aria-label="הסר קובץ"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className={`${styles.dropzone} ${doc.required && !files[doc.key] ? styles.dropzoneRequired : ''}`}>
                <div className={styles.dropzoneIcon}>📎</div>
                <div className={styles.dropzoneLabel}>
                  לחצו לבחירת קובץ
                  <br />
                  <span className={styles.dropzoneHint}>
                    PDF, JPG, PNG — עד 20MB
                  </span>
                </div>
                <input
                  type="file"
                  className={styles.dropzoneInput}
                  accept={ACCEPTED_TYPES}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null
                    handleFileSelect(doc.key, f)
                    // Reset so same file can be re-selected
                    e.target.value = ''
                  }}
                />
              </div>
            )}

            {fileErrors[doc.key] && (
              <div className={styles.fieldError}>{fileErrors[doc.key]}</div>
            )}
          </div>
        ))}

        <div className={styles.buttonRow}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={goBack}
          >
            חזרה
          </button>
          <button type="button" className={styles.btnPrimary} onClick={goNext}>
            הבא
          </button>
        </div>
      </>
    )
  }

  // -------------------------------------------------------------------------
  // Step 4 — Review & Submit
  // -------------------------------------------------------------------------
  function renderStep4() {
    const clientLabel =
      CLIENT_TYPE_OPTIONS.find((o) => o.value === clientType)?.label ??
      clientType

    const personalRows: [string, string][] = [
      ['סוג לקוח', clientLabel],
      ['שם מלא', formData.fullName],
      ['ת"ז / ח"פ', formData.companyNumber],
      ['טלפון', formData.phone],
      ['דוא"ל', formData.email],
    ]
    if (formData.address) personalRows.push(['כתובת', formData.address])
    if (formData.city) personalRows.push(['יישוב', formData.city])
    if (formData.zipCode) personalRows.push(['מיקוד', formData.zipCode])
    if (formData.birthdate)
      personalRows.push(['תאריך לידה', formData.birthdate])
    if (formData.businessSector)
      personalRows.push(['תחום עיסוק', formData.businessSector])
    if (formData.shareholderDetails)
      personalRows.push(['פרטי בעלי מניות', formData.shareholderDetails])

    const fileEntries = Object.entries(files)

    return (
      <>
        <h2 className={styles.stepTitle}>סיכום ואישור</h2>
        <p className={styles.stepSubtitle}>בדקו שהכל נכון לפני השליחה</p>

        <h3 className={styles.summarySection}>פרטים אישיים</h3>
        <table className={styles.summaryTable}>
          <tbody>
            {personalRows.map(([label, value]) => (
              <tr key={label}>
                <th>{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className={styles.summarySection}>
          מסמכים ({fileEntries.length})
        </h3>
        {fileEntries.length === 0 ? (
          <p style={{ color: '#4A5568', fontSize: '0.9rem' }}>
            לא הועלו מסמכים
          </p>
        ) : (
          <ul className={styles.summaryFileList}>
            {fileEntries.map(([key, file]) => {
              const doc = DOC_FIELDS.find((d) => d.key === key)
              return (
                <li key={key} className={styles.summaryFileItem}>
                  <span className={styles.summaryFileIcon}>✓</span>
                  <span>
                    {doc?.label ?? key} — {file.name} (
                    {formatFileSize(file.size)})
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {hasMissingDocs && !showConfirmSubmit && (
          <div className={styles.warningBanner}>
            <strong>חסרים מסמכי חובה:</strong>
            {missingRequiredDocs.map(d => d.label).join(', ')}
            <br />
            <button type="button" className={styles.backToDocsBtn} onClick={() => {
              setStep(skipTypeStep ? 3 : 4)
            }}>
              חזרה למסמכים
            </button>
          </div>
        )}

        <div className={styles.buttonRow}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={goBack}
            disabled={submitting}
          >
            חזרה
          </button>
        </div>

        {showConfirmSubmit ? (
          <div className={styles.confirmPanel}>
            <p className={styles.confirmText}>
              לא העליתם את כל מסמכי החובה. ניתן להשלים גם מאוחר יותר. לשלוח בכל זאת?
            </p>
            <div className={styles.confirmButtons}>
              <button
                type="button"
                className={styles.btnSubmit}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className={styles.spinner} />
                    שולח...
                  </>
                ) : (
                  'שלח בכל זאת'
                )}
              </button>
              <button type="button" className={styles.backToDocsBtn} onClick={() => {
                setShowConfirmSubmit(false)
                setStep(skipTypeStep ? 3 : 4)
              }}>
                חזרה למסמכים
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className={styles.btnSubmit}
            onClick={() => {
              if (hasMissingDocs) {
                setShowConfirmSubmit(true)
              } else {
                handleSubmit()
              }
            }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className={styles.spinner} />
                שולח...
              </>
            ) : (
              'שלח'
            )}
          </button>
        )}
      </>
    )
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.brandName}>ביטן את ביטן — רואי חשבון</h1>
        <div className={styles.brandUnderline} />
        <p className={styles.greeting}>
          ברוכים הבאים! מלאו את הפרטים הבאים כדי שנתחיל לעבוד יחד.
        </p>
      </div>

      {progressBar}

      <div className={styles.card}>
        {showWelcome && (
          <div className={styles.welcomeBanner}>
            <button
              type="button"
              className={styles.welcomeDismiss}
              onClick={() => setShowWelcome(false)}
              aria-label="סגור"
            >
              ✕
            </button>
            ברוכים השבים! שמרנו את הפרטים שמילאתם. קבצים שהועלו בעבר לא נשמרים — יש להעלות שוב.
          </div>
        )}
        {contentStep === 'type' && renderStep1()}
        {contentStep === 'details' && renderStep2()}
        {contentStep === 'business' && renderStepBusiness()}
        {contentStep === 'docs' && renderStep3()}
        {contentStep === 'review' && renderStep4()}
      </div>
    </div>
  )
}
