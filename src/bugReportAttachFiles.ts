import {
  analyzeBugReportCsvFile,
  readBugReportCsvFirstLine,
  type BugReportCsvAttachment,
} from './bugReportCsvAttachment'
import {
  analyzeBugReportSaveFile,
  type BugReportSaveAttachment,
} from './bugReportSaveAttachment'
import { TOWER_UNIFIED_CSV_MAGIC } from './towerUnifiedCsv'

export type BugReportAttachFileError =
  | 'save_empty'
  | 'save_too_large'
  | 'csv_empty'
  | 'csv_too_large'
  | 'csv_invalid'
  | 'unrecognized'

export type AnalyzeBugReportAttachmentResult =
  | { ok: true; kind: 'save'; file: File; attachment: BugReportSaveAttachment }
  | { ok: true; kind: 'csv'; file: File; attachment: BugReportCsvAttachment }
  | { ok: false; error: BugReportAttachFileError }

function isCsvFileName(file: File): boolean {
  return /\.csv$/i.test(file.name)
}

function isDatFileName(file: File): boolean {
  return /\.dat$/i.test(file.name)
}

/** Classify and validate one Bug Buster attachment (player save or tower CSV). */
export async function analyzeBugReportAttachment(
  file: File,
): Promise<AnalyzeBugReportAttachmentResult> {
  if (isCsvFileName(file)) {
    const firstLine = await readBugReportCsvFirstLine(file)
    if (firstLine !== TOWER_UNIFIED_CSV_MAGIC) {
      return { ok: false, error: 'csv_invalid' }
    }
    const csv = await analyzeBugReportCsvFile(file)
    if (csv.ok) return { ok: true, kind: 'csv', file, attachment: csv.attachment }
    if (csv.error === 'too_large') return { ok: false, error: 'csv_too_large' }
    if (csv.error === 'invalid_magic') return { ok: false, error: 'csv_invalid' }
    return { ok: false, error: 'csv_empty' }
  }

  if (!isDatFileName(file)) {
    return { ok: false, error: 'unrecognized' }
  }

  const save = await analyzeBugReportSaveFile(file)
  if (save.ok) return { ok: true, kind: 'save', file, attachment: save.attachment }
  if (save.error === 'too_large') return { ok: false, error: 'save_too_large' }
  if (save.error === 'empty') return { ok: false, error: 'save_empty' }
  return { ok: false, error: 'unrecognized' }
}
