'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  CLIENT_TYPE_OPTIONS,
  DOC_FIELDS,
  getDocCategory,
  type DocField,
} from '@/lib/intake-types'
import styles from './intake.module.css'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png'

const STEP_LABELS = ['סוג לקוח', 'פרטים אישיים', 'מסמכים', 'סיכום']
const TOTAL_STEPS = 4

interface FormFields {
  fullName: string
  companyNumber: string
  phone: string
  email: string
  address: string
  city: string
  zipCode: string
  birthdate: string
  businessSector: string
  shareholderDetails: string
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
  businessSector: '',
  shareholderDetails: '',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function IntakeForm({ token }: { token: string }) {
  const [step, setStep] = useState(1)
  const [clientType, setClientType] = useState('')
  const [formData, setFormData] = useState<FormFields>(EMPTY_FORM)
  const [files, setFiles] = useState<Record<string, File>>({})
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const progressTrackRef = useRef<HTMLDivElement>(null)
  const [fillWidth, setFillWidth] = useState('0%')

  // -------------------------------------------------------------------------
  // Progress bar fill calculation
  // -------------------------------------------------------------------------
  useEffect(() => {
    function calcFill() {
      const track = progressTrackRef.current
      if (!track) return
      const circles = track.querySelectorAll('[data-step]')
      if (circles.length < 2) return

      const trackRect = track.getBoundingClientRect()
      const firstCircle = circles[0].getBoundingClientRect()
      const lastCircle = circles[circles.length - 1].getBoundingClientRect()
      const totalWidth = lastCircle.left + lastCircle.width / 2 - (firstCircle.left + firstCircle.width / 2)

      if (step <= 1) {
        setFillWidth('0px')
        return
      }

      const targetCircle = circles[step - 1].getBoundingClientRect()
      const width = targetCircle.left + targetCircle.width / 2 - (firstCircle.left + firstCircle.width / 2)
      setFillWidth(`${width}px`)
    }

    calcFill()
    window.addEventListener('resize', calcFill)
    return () => window.removeEventListener('resize', calcFill)
  }, [step])

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const docCategory = clientType ? getDocCategory(clientType) : 'individual'
  const relevantDocs: DocField[] = DOC_FIELDS.filter((d) =>
    d.categories.includes(docCategory),
  )

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
  // Navigation
  // -------------------------------------------------------------------------
  function goNext() {
    if (step === 2 && !validateStep2()) return
    setStep((s) => Math.min(s + 1, 4))
  }

  function goBack() {
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
      fd.append('fullName', formData.fullName.trim())
      fd.append('companyNumber', formData.companyNumber.trim())
      fd.append('phone', formData.phone.trim())
      fd.append('email', formData.email.trim())
      if (formData.address.trim()) fd.append('address', formData.address.trim())
      if (formData.city.trim()) fd.append('city', formData.city.trim())
      if (formData.zipCode.trim()) fd.append('zipCode', formData.zipCode.trim())
      if (formData.birthdate) fd.append('birthdate', formData.birthdate)
      if (formData.businessSector.trim())
        fd.append('businessSector', formData.businessSector.trim())
      if (formData.shareholderDetails.trim())
        fd.append('shareholderDetails', formData.shareholderDetails.trim())

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
        {STEP_LABELS.map((label, i) => {
          const n = i + 1
          const isCompleted = n < step
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
    return (
      <>
        <h2 className={styles.stepTitle}>איזה סוג עסק?</h2>
        <p className={styles.stepSubtitle}>בחרו את הסוג שמתאים לכם</p>
        <div className={styles.cardGrid}>
          {CLIENT_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={
                clientType === opt.value
                  ? styles.typeCardSelected
                  : styles.typeCard
              }
              onClick={() => {
                setClientType(opt.value)
                setStep(2)
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
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
        {renderInput('birthdate', 'תאריך לידה', false, 'date')}
        {renderInput('businessSector', 'תחום עיסוק', false)}

        {showShareholders && (
          <div className={styles.fieldGroup}>
            <label className={styles.label}>פרטי בעלי מניות</label>
            <textarea
              className={styles.textarea}
              value={formData.shareholderDetails}
              onChange={(e) =>
                updateField('shareholderDetails', e.target.value)
              }
              placeholder="שם, ת.ז, אחוז אחזקה..."
            />
          </div>
        )}

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
        <p className={styles.stepSubtitle}>העלו את המסמכים הנדרשים (ניתן להשלים גם אחר כך)</p>

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
              <div className={styles.dropzone}>
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
            'שלח'
          )}
        </button>
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
          ברוכים הבאים! מלאו את הפרטים הבאים כדי שנוכל להתחיל לעבוד יחד.
        </p>
      </div>

      {progressBar}

      <div className={styles.card}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  )
}
