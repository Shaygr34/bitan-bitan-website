import { defineField, defineType } from 'sanity'

/**
 * Tax Configuration Singleton — הגדרות מס
 *
 * Centralized Israeli tax constants for all calculator tools.
 * Updated once per tax year (January). Both leasing and employer
 * calculators read from this document.
 *
 * Singleton ID: 'taxConfig'
 */
export default defineType({
  name: 'taxConfig',
  title: 'הגדרות מס',
  type: 'document',
  fieldsets: [
    { name: 'general', title: 'כללי', options: { collapsible: true, collapsed: false } },
    { name: 'brackets', title: 'מדרגות מס הכנסה', options: { collapsible: true, collapsed: false } },
    { name: 'nii', title: 'ביטוח לאומי', options: { collapsible: true, collapsed: true } },
    { name: 'vehicle', title: 'שווי מס רכב', options: { collapsible: true, collapsed: true } },
    { name: 'pension', title: 'פנסיה וחיסכון', options: { collapsible: true, collapsed: true } },
    { name: 'creditPoints', title: 'נקודות זיכוי', options: { collapsible: true, collapsed: true } },
    { name: 'leasing', title: 'ליסינג — הגדרות ייחודיות', options: { collapsible: true, collapsed: true } },
    { name: 'employer', title: 'עלות מעסיק — הגדרות ייחודיות', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    // ─── General ───────────────────────────────────────────────────────
    defineField({
      name: 'taxYear',
      title: 'שנת מס',
      type: 'number',
      fieldset: 'general',
      validation: (r) => r.required().min(2024).max(2040),
      initialValue: 2026,
    }),
    defineField({
      name: 'primeRate',
      title: 'ריבית פריים (%)',
      type: 'number',
      fieldset: 'general',
      description: 'ריבית הפריים של בנק ישראל. למשל: 5.5',
      initialValue: 5.5,
    }),
    defineField({
      name: 'vatRate',
      title: 'מע"מ (%)',
      type: 'number',
      fieldset: 'general',
      description: 'אחוז מע"מ. למשל: 18',
      initialValue: 18,
    }),
    defineField({
      name: 'companyTaxRate',
      title: 'מס חברות (%)',
      type: 'number',
      fieldset: 'general',
      description: 'אחוז מס חברות. למשל: 23',
      initialValue: 23,
    }),

    // ─── Tax Brackets ──────────────────────────────────────────────────
    defineField({
      name: 'taxBrackets',
      title: 'מדרגות מס (שנתי)',
      type: 'array',
      fieldset: 'brackets',
      description: 'מדרגות מס הכנסה — תקרה שנתית באלפי ₪ ואחוז מס. המדרגה האחרונה (50%) ללא תקרה.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'ceiling', title: 'תקרה שנתית (₪)', type: 'number', validation: (r) => r.required().min(0) }),
            defineField({ name: 'rate', title: 'אחוז מס (%)', type: 'number', validation: (r) => r.required().min(0).max(100) }),
          ],
          preview: {
            select: { ceiling: 'ceiling', rate: 'rate' },
            prepare: ({ ceiling, rate }) => ({
              title: ceiling ? `עד ${ceiling?.toLocaleString('he-IL')} ₪` : 'ללא תקרה',
              subtitle: `${rate}%`,
            }),
          },
        },
      ],
    }),

    // ─── NII ───────────────────────────────────────────────────────────
    defineField({
      name: 'niiLowThreshold',
      title: 'סף מדרגה נמוכה (חודשי ₪)',
      type: 'number',
      fieldset: 'nii',
      initialValue: 7703,
    }),
    defineField({
      name: 'niiHighThreshold',
      title: 'סף מדרגה גבוהה (חודשי ₪)',
      type: 'number',
      fieldset: 'nii',
      initialValue: 51910,
    }),
    defineField({
      name: 'niiEmployeeLow',
      title: 'עובד — מדרגה נמוכה (%)',
      type: 'number',
      fieldset: 'nii',
      description: 'למשל: 4.27',
      initialValue: 4.27,
    }),
    defineField({
      name: 'niiEmployeeHigh',
      title: 'עובד — מדרגה גבוהה (%)',
      type: 'number',
      fieldset: 'nii',
      description: 'למשל: 12.17',
      initialValue: 12.17,
    }),
    defineField({
      name: 'niiEmployerLow',
      title: 'מעסיק — מדרגה נמוכה (%)',
      type: 'number',
      fieldset: 'nii',
      description: 'למשל: 4.51',
      initialValue: 4.51,
    }),
    defineField({
      name: 'niiEmployerHigh',
      title: 'מעסיק — מדרגה גבוהה (%)',
      type: 'number',
      fieldset: 'nii',
      description: 'למשל: 7.6',
      initialValue: 7.6,
    }),

    // ─── Vehicle שווי מס ───────────────────────────────────────────────
    defineField({
      name: 'vehicleTaxRate',
      title: 'שיעור שווי שימוש (%)',
      type: 'number',
      fieldset: 'vehicle',
      description: 'אחוז שווי שימוש ממחיר יצרן. למשל: 2.48',
      initialValue: 2.48,
    }),
    defineField({
      name: 'manufacturerPriceCap',
      title: 'תקרת מחיר יצרן (₪)',
      type: 'number',
      fieldset: 'vehicle',
      initialValue: 596860,
    }),
    defineField({
      name: 'electricReduction',
      title: 'הפחתה — חשמלי (₪/חודש)',
      type: 'number',
      fieldset: 'vehicle',
      initialValue: 1350,
    }),
    defineField({
      name: 'plugInReduction',
      title: 'הפחתה — פלאג אין (₪/חודש)',
      type: 'number',
      fieldset: 'vehicle',
      initialValue: 1130,
    }),
    defineField({
      name: 'hybridReduction',
      title: 'הפחתה — היברידי (₪/חודש)',
      type: 'number',
      fieldset: 'vehicle',
      initialValue: 560,
    }),

    // ─── Pension & Savings ─────────────────────────────────────────────
    defineField({
      name: 'avgSalary',
      title: 'שכר ממוצע במשק (₪)',
      type: 'number',
      fieldset: 'pension',
      initialValue: 13769,
    }),
    defineField({
      name: 'severanceCap',
      title: 'תקרת פיצויים (₪)',
      type: 'number',
      fieldset: 'pension',
      initialValue: 34900,
    }),
    defineField({
      name: 'educationFundCap',
      title: 'תקרת קרן השתלמות (₪)',
      type: 'number',
      fieldset: 'pension',
      initialValue: 15712,
    }),
    defineField({
      name: 'pensionCreditSalaryCap',
      title: 'תקרת שכר מבוטח קצבה מזכה (₪)',
      type: 'number',
      fieldset: 'pension',
      initialValue: 9700,
    }),
    defineField({
      name: 'pensionCreditRate',
      title: 'שיעור הפקדה לקצבה מזכה (%)',
      type: 'number',
      fieldset: 'pension',
      description: 'למשל: 7',
      initialValue: 7,
    }),
    defineField({
      name: 'pensionCreditTaxRate',
      title: 'שיעור זיכוי מס על הפקדה (%)',
      type: 'number',
      fieldset: 'pension',
      description: 'למשל: 35',
      initialValue: 35,
    }),

    // ─── Credit Points ─────────────────────────────────────────────────
    defineField({
      name: 'creditPointValue',
      title: 'ערך נקודת זיכוי (₪/שנה)',
      type: 'number',
      fieldset: 'creditPoints',
      initialValue: 2904,
    }),

    // ─── Leasing-specific ──────────────────────────────────────────────
    defineField({
      name: 'depreciationPetrol',
      title: 'פחת שנתי — בנזין (%)',
      type: 'number',
      fieldset: 'leasing',
      description: 'למשל: 15',
      initialValue: 15,
    }),
    defineField({
      name: 'depreciationElectric',
      title: 'פחת שנתי — חשמלי (%)',
      type: 'number',
      fieldset: 'leasing',
      description: 'למשל: 20',
      initialValue: 20,
    }),
    defineField({
      name: 'vatRecoveryPrivate',
      title: 'שיעור החזר מע"מ — רכב פרטי (%)',
      type: 'number',
      fieldset: 'leasing',
      description: 'למשל: 67',
      initialValue: 67,
    }),
    defineField({
      name: 'taxDeductionPrivate',
      title: 'מכפיל ניכוי מס — רכב פרטי (%)',
      type: 'number',
      fieldset: 'leasing',
      description: 'למשל: 45 (מסחרי תמיד 100%)',
      initialValue: 45,
    }),

    // ─── Employer-specific ─────────────────────────────────────────────
    defineField({
      name: 'defaultTravelAllowance',
      title: 'נסיעות ברירת מחדל (₪)',
      type: 'number',
      fieldset: 'employer',
      initialValue: 315,
    }),
    defineField({
      name: 'surchargeThreshold',
      title: 'סף מס יסף חודשי (₪)',
      type: 'number',
      fieldset: 'employer',
      initialValue: 60130,
    }),
  ],
  preview: {
    select: { taxYear: 'taxYear' },
    prepare: ({ taxYear }) => ({
      title: `הגדרות מס ${taxYear || ''}`,
      subtitle: 'הגדרות משותפות לכל המחשבונים',
    }),
  },
})
