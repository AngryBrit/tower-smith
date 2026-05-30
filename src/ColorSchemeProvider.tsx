import type { ReactNode } from 'react'
import { useColorSchemePreference } from './colorSchemePreference'
import { ColorSchemeContext } from './colorSchemeContext'

export function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference, resolved] = useColorSchemePreference()
  return (
    <ColorSchemeContext.Provider value={{ preference, setPreference, resolved }}>
      {children}
    </ColorSchemeContext.Provider>
  )
}
