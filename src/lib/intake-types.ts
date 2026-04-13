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

/* ─── Onboarding Paths (4 paths per Avi's spec) ─── */

export type OnboardingPath = 'new-individual' | 'new-company' | 'transfer-individual' | 'transfer-company'

export const ONBOARDING_PATHS: { value: OnboardingPath; label: string; description: string }[] = [
  { value: 'new-individual', label: 'עצמאי חדש', description: 'לקוח חדש ללא תיק ברשויות' },
  { value: 'new-company', label: 'חברה חדשה', description: 'חברה חדשה ללא תיק ברשויות' },
  { value: 'transfer-individual', label: 'עצמאי שעובר', description: 'מעבר מרו"ח אחר' },
  { value: 'transfer-company', label: 'חברה שעוברת', description: 'מעבר מרו"ח אחר' },
]

export function isTransferPath(path: OnboardingPath): boolean {
  return path === 'transfer-individual' || path === 'transfer-company'
}

export function isCompanyPath(path: OnboardingPath): boolean {
  return path === 'new-company' || path === 'transfer-company'
}

/** Client types shown in form — simplified labels */
export const CLIENT_TYPE_OPTIONS = [
  { value: 'עצמאי', label: 'עוסק מורשה' },
  { value: 'פטור', label: 'עוסק פטור' },
  { value: 'חברה', label: 'חברה בע"מ' },
  { value: 'שותפות', label: 'שותפות' },
  { value: 'עסק זעיר', label: 'עסק זעיר' },
  { value: 'עמותה', label: 'עמותה' },
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
  /** Only show for transfer paths */
  transferOnly?: boolean
}

/** Document upload fields per client type category */
export const DOC_FIELDS: DocField[] = [
  { key: 'idCard', label: 'צילום ת.ז + ספח', summitField: 'ת.ז/ רישיון בעלים', required: true, categories: ['individual', 'company', 'exempt'] },
  { key: 'driverLicense', label: 'צילום רישיון נהיגה', summitField: 'ת.ז/ רישיון בעלים', required: true, categories: ['individual', 'company', 'exempt'] },
  { key: 'bankApproval', label: 'אישור ניהול חשבון / שיק מבוטל', summitField: 'אישור ניהול חשבון', required: true, categories: ['individual', 'company'] },
  { key: 'osekMurshe', label: 'תעודת עוסק מורשה', summitField: 'תעודת עוסק מורשה', required: false, categories: ['individual'] },
  { key: 'ptihaTikMaam', label: 'פתיחת תיק מע"מ', summitField: 'פתיחת תיק מעמ', required: false, categories: ['individual', 'company'] },
  { key: 'teudatHitagdut', label: 'תעודת התאגדות', summitField: 'תעודת התאגדות', required: true, categories: ['company'] },
  { key: 'takanonHevra', label: 'תקנון חברה', summitField: 'תקנון חברה', required: false, categories: ['company'] },
  { key: 'protokolMurshe', label: 'פרוטוקול מורשה חתימה', summitField: 'פרוטוקול מורשה חתימה', required: false, categories: ['company'] },
  { key: 'nesahHevra', label: 'נסח חברה', summitField: 'נסח חברה', required: false, categories: ['company'] },
  { key: 'rentalContract', label: 'חוזה שכירות (ככל וקיים)', summitField: '', required: false, categories: ['individual', 'company'] },
]

/* ─── Business Sector Taxonomy (25 categories) ─── */

export const BUSINESS_SECTORS = [
  'נדל"ן ושכירות',
  'בנייה ושיפוצים',
  'ייעוץ וניהול',
  'טכנולוגיה ודיגיטל',
  'מזון ומסעדנות',
  'אופנה וטקסטיל',
  'ביטוח ופיננסים',
  'עריכת דין',
  'ראיית חשבון',
  'בריאות ורפואה',
  'טיפול ופסיכולוגיה',
  'חינוך והדרכה',
  'עיצוב ויצירה',
  'צילום ומדיה',
  'מוזיקה ובידור',
  'יבוא וסחר',
  'קמעונאות',
  'הובלות ושליחויות',
  'כושר וספורט',
  'יופי וטיפוח',
  'רכב ומוסכים',
  'ניקיון ותחזוקה',
  'תעשייה וייצור',
  'חקלאות ובעלי חיים',
  'אחר',
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

/** Form submission data shape — V2 with all 4 paths */
export interface IntakeSubmission {
  token: string
  onboardingPath: OnboardingPath
  clientType: string
  // Personal / business
  fullName: string
  businessName: string
  companyNumber: string
  phone: string
  email: string
  address?: string
  city?: string
  zipCode?: string
  birthdate?: string
  businessSector?: string
  hasEmployees?: boolean
  employeeCount?: number
  shareholderDetails?: string
  // Transfer-specific
  previousCpaName?: string
  previousCpaEmail?: string
  previousCpaSoftware?: string
  // Files
  files: Record<string, File>
}

/* ─── Summit Field Mapping ─── */
// Every form field → Summit API field name
// This is the source of truth for where data goes

export const SUMMIT_FIELD_MAP: Record<string, string> = {
  fullName: 'Customers_FullName',
  companyNumber: 'Customers_CompanyNumber',
  phone: 'Customers_Phone',
  email: 'Customers_EmailAddress',
  address: 'Customers_Address',
  city: 'Customers_City',
  zipCode: 'Customers_ZipCode',
  birthdate: 'Customers_Birthdate',
  businessSector: 'תחום עיסוק', // Entity ref — needs ID lookup
  shareholderDetails: 'פרטי בעלי מניות',
  // Transfer data → stored in Customers_Text (structured text)
  // previousCpaName, previousCpaEmail, previousCpaSoftware → Customers_Text
  // businessName → Customers_FullName for companies, Customers_Text for individuals
  // hasEmployees/employeeCount → Books_EmployeesCount (bookkeeping folder, post-intake)
}

// Auto-set fields on intake creation
export const AUTO_SET_FIELDS: Record<string, unknown> = {
  'Customers_Status': 'חדש', // Needs entity ID lookup
  'מועד תחילת ייצוג': new Date().toISOString().split('T')[0],
}
