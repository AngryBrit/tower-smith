/** Supabase project ref from a JWT payload (`ref` claim), without verifying the signature. */
export function jwtProjectRef(jwt: string): string | null {
  const parts = jwt.split('.')
  if (parts.length < 2) return null
  try {
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
    const payload = JSON.parse(
      Buffer.from(padded + pad, 'base64').toString('utf8'),
    ) as { ref?: unknown }
    return typeof payload.ref === 'string' && payload.ref.trim()
      ? payload.ref.trim()
      : null
  } catch {
    return null
  }
}
