import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  FIRST_RUN_HINT_STORAGE_KEY,
  readFirstRunHintDismissed,
  readWhatsNewSeenVersion,
  shouldShowWhatsNewBanner,
  WHATS_NEW_SEEN_VERSION_KEY,
  writeFirstRunHintDismissed,
  writeWhatsNewSeenVersion,
} from './appHintsStorage'

function createLocalStorageMock() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => store.clear(),
  }
}

describe('appHintsStorage', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('tracks first-run dismissal', () => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
    expect(readFirstRunHintDismissed()).toBe(false)
    writeFirstRunHintDismissed()
    expect(readFirstRunHintDismissed()).toBe(true)
    expect(localStorage.getItem(FIRST_RUN_HINT_STORAGE_KEY)).toBe('1')
  })

  it('shows whats-new when version has copy and was not seen', () => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
    expect(shouldShowWhatsNewBanner('3.0.0')).toBe(true)
    writeWhatsNewSeenVersion('3.0.0')
    expect(readWhatsNewSeenVersion()).toBe('3.0.0')
    expect(shouldShowWhatsNewBanner('3.0.0')).toBe(false)
    expect(shouldShowWhatsNewBanner('9.9.9')).toBe(false)
  })

  it('persists seen version key', () => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
    writeWhatsNewSeenVersion('2.8.10')
    expect(localStorage.getItem(WHATS_NEW_SEEN_VERSION_KEY)).toBe('2.8.10')
  })
})
