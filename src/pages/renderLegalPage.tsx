import type { ReactNode } from 'react'
import { LegalPageFrame } from './LegalPageFrame'
import Privacy from './Privacy'
import Terms from './Terms'
import { legalRouteFromPathname } from './legalRoute'

export function renderLegalPage(pathname: string): ReactNode | null {
  const route = legalRouteFromPathname(pathname)
  if (route === 'privacy') {
    return (
      <LegalPageFrame title="Privacy Policy">
        <Privacy />
      </LegalPageFrame>
    )
  }
  if (route === 'terms') {
    return (
      <LegalPageFrame title="Terms of Service">
        <Terms />
      </LegalPageFrame>
    )
  }
  return null
}
