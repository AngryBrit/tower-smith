import { createContext, useContext } from 'react'
import type { ColorSchemePreference, ResolvedColorScheme } from './colorSchemePreference'

export type ColorSchemeContextValue = {
  preference: ColorSchemePreference
  setPreference: (next: ColorSchemePreference) => void
  resolved: ResolvedColorScheme
}

export const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null)

export function useColorScheme(): ColorSchemeContextValue {
  const ctx = useContext(ColorSchemeContext)
  if (!ctx) {
    throw new Error('useColorScheme must be used within ColorSchemeProvider')
  }
  return ctx
}
