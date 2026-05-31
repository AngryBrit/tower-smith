import { PLAYER_INFO_MAX_BYTES, validatePlayerInfoSize } from './playerSave/playerInfoLimits'

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

/** Trigger a download of the selected save so the user can attach it in email or GitHub. */
export function downloadBugReportSaveFile(file: File, downloadName?: string): void {
  const url = URL.createObjectURL(file)
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = downloadName ?? (file.name || 'playerInfo.dat')
    anchor.rel = 'noopener'
    anchor.click()
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function canShareBugReportWithFiles(file: File): boolean {
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') {
    return false
  }
  try {
    return navigator.canShare({ files: [file] })
  } catch {
    return false
  }
}

/** Share report text + save via the Web Share API (common on mobile). */
export async function shareBugReportWithSave(
  reportText: string,
  file: File,
  title: string,
): Promise<'shared' | 'aborted' | 'failed'> {
  if (!canShareBugReportWithFiles(file)) return 'failed'
  try {
    await navigator.share({
      title,
      text: reportText,
      files: [file],
    })
    return 'shared'
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return 'aborted'
    return 'failed'
  }
}
