import { TOWER_UNIFIED_CSV_MAGIC } from './towerUnifiedCsv'
import { formatSaveBytes, sha256HexFromBytes } from './bugReportSaveAttachment'

/** Max tower CSV export size for bug reports (well above typical exports). */
export const BUG_REPORT_MAX_CSV_BYTES = 2 * 1024 * 1024

export type BugReportCsvAttachment = {
  fileName: string
  sizeBytes: number
  sha256Hex: string
  towerCsv: boolean
}

export type AnalyzeBugReportCsvResult =
  | { ok: true; attachment: BugReportCsvAttachment }
  | { ok: false; error: 'empty' | 'too_large' | 'invalid_magic' }

function validateCsvSize(sizeBytes: number): 'empty' | 'too_large' | null {
  if (sizeBytes <= 0) return 'empty'
  if (sizeBytes > BUG_REPORT_MAX_CSV_BYTES) return 'too_large'
  return null
}

async function readFirstCsvLine(file: File): Promise<string> {
  const head = file.slice(0, Math.min(file.size, 4096))
  const text = await head.text()
  const line = text.split(/\r?\n/)[0]?.replace(/^\uFEFF/, '').trim() ?? ''
  return line
}

export async function analyzeBugReportCsvFile(
  file: File,
): Promise<AnalyzeBugReportCsvResult> {
  const sizeError = validateCsvSize(file.size)
  if (sizeError) return { ok: false, error: sizeError }

  const firstLine = await readFirstCsvLine(file)
  if (firstLine !== TOWER_UNIFIED_CSV_MAGIC) {
    return { ok: false, error: 'invalid_magic' }
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const attachment: BugReportCsvAttachment = {
    fileName: file.name.trim() || 'tower-export.csv',
    sizeBytes: file.size,
    sha256Hex: await sha256HexFromBytes(bytes),
    towerCsv: true,
  }
  return { ok: true, attachment }
}

export { formatSaveBytes as formatCsvBytes }
