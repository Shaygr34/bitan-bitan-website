/** Summit סוג לקוח entity IDs */
export const CLIENT_TYPE_IDS: Record<string, number> = {
  'עצמאי': 1099570216,
  'עצמאי שנתי': 1099570129,
  'חברה': 1099570010,
  'חברה שנתי': 1099569991,
  'פטור': 1099570246,
  'שותפות': 1099570170,
  'עמותה': 1099570107,
  'עסק זעיר': 1099570213,
  'החזר מס': 1179325026,
}

/** Client types shown in form dropdown */
export const CLIENT_TYPE_OPTIONS = [
  { value: 'עצמאי', label: 'עצמאי (חודשי)' },
  { value: 'עצמאי שנתי', label: 'עצמאי (שנתי)' },
  { value: 'חברה', label: 'חברה בע"מ (חודשי)' },
  { value: 'חברה שנתי', label: 'חברה בע"מ (שנתי)' },
  { value: 'פטור', label: 'פטור ממע"מ' },
  { value: 'שותפות', label: 'שותפות' },
  { value: 'עמותה', label: 'עמותה' },
  { value: 'עסק זעיר', label: 'עסק זעיר' },
  { value: 'החזר מס', label: 'החזר מס' },
] as const

/** Which document uploads are required/optional per client type category */
export type DocCategory = 'individual' | 'company' | 'exempt'

export function getDocCategory(clientType: string): DocCategory {
  if (['חברה', 'חברה שנתי', 'שותפות', 'עמותה'].includes(clientType)) return 'company'
  if (clientType === 'פטור') return 'exempt'
  return 'individual'
}

export interface DocField {
  key: string
  label: string
  summitField: string
  required: boolean
  categories: DocCategory[]
}

/** Document upload fields per client type category */
export const DOC_FIELDS: DocField[] = [
  { key: 'idCard', label: 'צילום ת.ז / רישיון', summitField: 'ת.ז/ רישיון בעלים', required: true, categories: ['individual', 'company', 'exempt'] },
  { key: 'osekMurshe', label: 'תעודת עוסק מורשה', summitField: 'תעודת עוסק מורשה', required: false, categories: ['individual'] },
  { key: 'nihulHeshbon', label: 'אישור ניהול חשבון', summitField: 'אישור ניהול חשבון', required: false, categories: ['individual', 'company'] },
  { key: 'ptihaTikMaam', label: 'פתיחת תיק מע"מ', summitField: 'פתיחת תיק מעמ', required: false, categories: ['individual', 'company'] },
  { key: 'teudatHitagdut', label: 'תעודת התאגדות', summitField: 'תעודת התאגדות', required: false, categories: ['company'] },
  { key: 'takanonHevra', label: 'תקנון חברה', summitField: 'תקנון חברה', required: false, categories: ['company'] },
  { key: 'protokolMurshe', label: 'פרוטוקול מורשה חתימה', summitField: 'פרוטוקול מורשה חתימה', required: false, categories: ['company'] },
  { key: 'nesahHevra', label: 'נסח חברה', summitField: 'נסח חברה', required: false, categories: ['company'] },
]

/** Newsletter flags auto-set based on client type */
export function getNewsletterFlags(clientType: string): Record<string, boolean> {
  const flags: Record<string, boolean> = { 'ניוזלטר כלל משרדי': true }
  if (['עצמאי', 'עצמאי שנתי', 'עסק זעיר', 'פטור', 'החזר מס'].includes(clientType)) {
    flags['ניוזלטר עצמאים'] = true
  }
  if (['חברה', 'חברה שנתי', 'שותפות', 'עמותה'].includes(clientType)) {
    flags['ניוזלטר חברות'] = true
  }
  return flags
}

/** Form submission data shape */
export interface IntakeSubmission {
  token: string
  clientType: string
  fullName: string
  companyNumber: string
  phone: string
  email: string
  address?: string
  city?: string
  zipCode?: string
  birthdate?: string
  businessSector?: string
  shareholderDetails?: string
  files: Record<string, File>
}
