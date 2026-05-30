export type LegalRoute = 'privacy' | 'terms'

/** Standalone legal pages served at `/privacy` and `/terms`. */
export function legalRouteFromPathname(pathname: string): LegalRoute | null {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  if (normalized === '/privacy') return 'privacy'
  if (normalized === '/terms') return 'terms'
  return null
}
