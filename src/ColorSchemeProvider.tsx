import { createContext, useContext, type ReactNode } from 'react'
import {
  useColorSchemePreference,
  type ColorSchemePreference,
  type ResolvedColorScheme,
} from './colorSchemePreference'

type ColorSchemeContextValue = {
  preference: ColorSchemePreference
  setPreference: (next: ColorSchemePreference) => void
  resolved: ResolvedColorScheme
}

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null)

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference, resolved] = useColorSchemePreference()
  return (
    <ColorSchemeContext.Provider value={{ preference, setPreference, resolved }}>
      {children}
    </ColorSchemeContext.Provider>
  )
}

export function useColorScheme(): ColorSchemeContextValue {
  const ctx = useContext(ColorSchemeContext)
  if (!ctx) {
    throw new Error('useColorScheme must be used within ColorSchemeProvider')
  }
  return ctx
}
