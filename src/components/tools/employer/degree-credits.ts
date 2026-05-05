/**
 * Degree Credits (זיכוי תואר אקדמי / מקצוע) — Ron May 2026 spec
 *
 * Israeli tax law grants extra credit points for the years immediately
 * following completion of an academic degree or qualifying profession.
 *
 * Rules per type:
 *   bachelor      — 1 nz, 3-year window starting `year`
 *                   (deferred=true → window starts year+1)
 *   master        — 0.5 nz, year only (1-year window)
 *   phdRegular    — 0.5 nz, 3-year window starting `year`
 *                   (deferred=true → window starts year+1)
 *   phdMedicine   — 2-year window. Year 1 → 1 nz. Year 2 → 0.5 nz.
 *   phdDirect     — combined: bachelor portion (year..year+2 → 1 nz)
 *                   + phd portion (phdYear..phdYear+1 → 0.5 nz)
 *   professional  — 1 nz, year only (mutex w/ bachelor/master same year — UI)
 *
 * Multiple degrees: credits sum. The professional ↔ bachelor/master mutual
 * exclusion is enforced by the input UI, not this engine.
 */

export type DegreeType =
  | 'bachelor'
  | 'master'
  | 'phdRegular'
  | 'phdDirect'
  | 'phdMedicine'
  | 'professional'

export type Degree = {
  type: DegreeType
  year: number
  /** phdDirect only: year of phd completion (bachelor year goes in `year`). */
  phdYear?: number
  /** bachelor / phdRegular only: postpone the eligibility window by +1 year. */
  deferred?: boolean
}

function creditForDegree(d: Degree, evalYear: number): number {
  switch (d.type) {
    case 'bachelor': {
      const start = d.deferred ? d.year + 1 : d.year
      return evalYear >= start && evalYear <= start + 2 ? 1 : 0
    }
    case 'master':
      return evalYear === d.year ? 0.5 : 0
    case 'phdRegular': {
      const start = d.deferred ? d.year + 1 : d.year
      return evalYear >= start && evalYear <= start + 2 ? 0.5 : 0
    }
    case 'phdMedicine': {
      if (evalYear === d.year) return 1
      if (evalYear === d.year + 1) return 0.5
      return 0
    }
    case 'phdDirect': {
      // Bachelor portion: 3-year window from `year`, 1 nz
      const inBachelor = evalYear >= d.year && evalYear <= d.year + 2
      if (inBachelor) return 1
      // Phd portion: 2-year window from `phdYear`, 0.5 nz
      if (typeof d.phdYear === 'number') {
        if (evalYear >= d.phdYear && evalYear <= d.phdYear + 1) return 0.5
      }
      return 0
    }
    case 'professional':
      return evalYear === d.year ? 1 : 0
  }
}

/**
 * Sum credit points across all listed degrees for a given evaluation year.
 */
export function calculateDegreeCredit(degrees: Degree[], evalYear: number): number {
  return degrees.reduce((sum, d) => sum + creditForDegree(d, evalYear), 0)
}
