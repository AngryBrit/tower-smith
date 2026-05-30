import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

export type ColorSchemePreference = 'dark' | 'light' | 'high-contrast'

/** Applied on `<html data-color-scheme="…">` (same values as preference). */
export type ResolvedColorScheme = ColorSchemePreference

export const COLOR_SCHEME_STORAGE_KEY = 'tower-export-color-scheme-v1'

const CHANGE_EVENT = 'tower-export-color-scheme-change'

const THEME_COLOR_BY_SCHEME: Record<ResolvedColorScheme, string> = {
  dark: '#0b1220',
  light: '#e2e8f0',
  'high-contrast': '#ffffff',
}

export function isColorSchemePreference(raw: string | null): raw is ColorSchemePreference {
  return raw === 'dark' || raw === 'light' || raw === 'high-contrast'
}

/** Maps legacy `system` storage to dark; default is dark. */
export function readColorSchemePreference(): ColorSchemePreference {
  try {
    const raw = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)
    if (raw === 'system') return 'dark'
    if (isColorSchemePreference(raw)) return raw
  } catch {
    /* private mode */
  }
  return 'dark'
}

export function writeColorSchemePreference(next: ColorSchemePreference): void {
  try {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, next)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

export function resolveColorScheme(preference: ColorSchemePreference): ResolvedColorScheme {
  return preference
}

export function applyResolvedColorScheme(scheme: ResolvedColorScheme): void {
  document.documentElement.dataset.colorScheme = scheme
  document.documentElement.style.colorScheme =
    scheme === 'dark' ? 'dark' : scheme === 'light' ? 'light' : 'light'

  const themeColor = THEME_COLOR_BY_SCHEME[scheme]
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta) meta.content = themeColor
}

export function syncDocumentColorScheme(preference: ColorSchemePreference): ResolvedColorScheme {
  const scheme = resolveColorScheme(preference)
  applyResolvedColorScheme(scheme)
  return scheme
}

export function useColorSchemePreference(): [
  ColorSchemePreference,
  (next: ColorSchemePreference) => void,
  ResolvedColorScheme,
] {
  const [preference, setPreference] = useState<ColorSchemePreference>(readColorSchemePreference)
  const [resolved, setResolved] = useState<ResolvedColorScheme>(() =>
    resolveColorScheme(readColorSchemePreference()),
  )

  useLayoutEffect(() => {
    const scheme = syncDocumentColorScheme(preference)
    setResolved(scheme)
  }, [preference])

  useEffect(() => {
    const sync = () => {
      const next = readColorSchemePreference()
      setPreference(next)
      setResolved(syncDocumentColorScheme(next))
    }
    window.addEventListener(CHANGE_EVENT, sync)
    const onStorage = (e: StorageEvent) => {
      if (e.key === COLOR_SCHEME_STORAGE_KEY || e.key === null) sync()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const setColorSchemePreference = useCallback((next: ColorSchemePreference) => {
    writeColorSchemePreference(next)
    setPreference(next)
    setResolved(syncDocumentColorScheme(next))
  }, [])

  return [preference, setColorSchemePreference, resolved]
}
