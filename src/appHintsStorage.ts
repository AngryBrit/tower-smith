import { APP_VERSION } from './appVersion'
import { getWhatsNewForVersion } from './whatsNew'

export const FIRST_RUN_HINT_STORAGE_KEY = 'tower-export-first-run-hint-v1'
export const WHATS_NEW_SEEN_VERSION_KEY = 'tower-export-whats-new-seen-v1'

export function readFirstRunHintDismissed(): boolean {
  try {
    return localStorage.getItem(FIRST_RUN_HINT_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function writeFirstRunHintDismissed(): void {
  try {
    localStorage.setItem(FIRST_RUN_HINT_STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function readWhatsNewSeenVersion(): string | null {
  try {
    const raw = localStorage.getItem(WHATS_NEW_SEEN_VERSION_KEY)?.trim()
    return raw || null
  } catch {
    return null
  }
}

export function writeWhatsNewSeenVersion(version: string = APP_VERSION): void {
  try {
    localStorage.setItem(WHATS_NEW_SEEN_VERSION_KEY, version)
  } catch {
    /* ignore */
  }
}

export function shouldShowWhatsNewBanner(version: string = APP_VERSION): boolean {
  if (!getWhatsNewForVersion(version)) return false
  return readWhatsNewSeenVersion() !== version
}
