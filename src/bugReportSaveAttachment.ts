import { prepareBugReportFilesForTransfer, zipPlayerInfoSaveFile } from './bugReportZip'
import { PLAYER_INFO_MAX_BYTES, validatePlayerInfoSize } from './playerSave/playerInfoLimits'

export { isPlayerInfoSaveFile, zipPlayerInfoSaveFile, prepareBugReportFilesForTransfer } from './bugReportZip'

/** @deprecated Use PLAYER_INFO_MAX_BYTES from playerSave/playerInfoLimits */
export const BUG_REPORT_MAX_SAVE_BYTES = PLAYER_INFO_MAX_BYTES

export type BugReportSaveAttachment = {
  fileName: string
  sizeBytes: number
  gzip: boolean
  sha256Hex: string
}

export type AnalyzeBugReportSaveResult =
  | { ok: true; attachment: BugReportSaveAttachment }
  | { ok: false; error: 'empty' | 'too_large' }

export function isGzipBytes(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b
}

export async function sha256HexFromBytes(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes)
  const hashBuffer = await crypto.subtle.digest('SHA-256', copy)
  return [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function analyzeBugReportSaveFile(
  file: File,
): Promise<AnalyzeBugReportSaveResult> {
  const sizeError = validatePlayerInfoSize(file.size)
  if (sizeError) return { ok: false, error: sizeError }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const attachment: BugReportSaveAttachment = {
    fileName: file.name.trim() || 'playerInfo.dat',
    sizeBytes: file.size,
    gzip: isGzipBytes(bytes),
    sha256Hex: await sha256HexFromBytes(bytes),
  }
  return { ok: true, attachment }
}

export function formatSaveBytes(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`
  return `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`
}

function downloadPreparedFile(file: File, downloadName?: string): void {
  const url = URL.createObjectURL(file)
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = downloadName ?? file.name
    anchor.rel = 'noopener'
    anchor.click()
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Trigger a download of the selected save (zipped) for email or GitHub attachment. */
export async function downloadBugReportSaveFile(file: File, downloadName?: string): Promise<void> {
  const zipFile = await zipPlayerInfoSaveFile(file)
  downloadPreparedFile(zipFile, downloadName ?? zipFile.name)
}

export function canShareBugReportWithFiles(files: File | File[]): boolean {
  const list = Array.isArray(files) ? files : [files]
  if (list.length === 0) return false
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') {
    return false
  }
  try {
    return navigator.canShare({ files: list })
  } catch {
    return false
  }
}

/** Share report text + attached files via the Web Share API (common on mobile). */
export async function shareBugReportWithFiles(
  reportText: string,
  files: File | File[],
  title: string,
): Promise<'shared' | 'aborted' | 'failed'> {
  const list = await prepareBugReportFilesForTransfer(Array.isArray(files) ? files : [files])
  if (!canShareBugReportWithFiles(list)) return 'failed'
  try {
    await navigator.share({
      title,
      text: reportText,
      files: list,
    })
    return 'shared'
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return 'aborted'
    return 'failed'
  }
}

/** @deprecated Use shareBugReportWithFiles */
export async function shareBugReportWithSave(
  reportText: string,
  file: File,
  title: string,
): Promise<'shared' | 'aborted' | 'failed'> {
  return shareBugReportWithFiles(reportText, file, title)
}

/** Trigger downloads for each attached file (email / GitHub fallback). Saves are zipped. */
export async function downloadBugReportAttachedFiles(files: File[]): Promise<void> {
  const prepared = await prepareBugReportFilesForTransfer(files)
  for (const file of prepared) {
    downloadPreparedFile(file)
  }
}
