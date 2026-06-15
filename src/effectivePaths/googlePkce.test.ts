import { describe, expect, it } from 'vitest'
import { createPkceChallenge, createPkceVerifier } from './googlePkce'

describe('googlePkce', () => {
  it('creates URL-safe verifier and matching S256 challenge', async () => {
    const verifier = createPkceVerifier()
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/)
    const challenge = await createPkceChallenge(verifier)
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(challenge).not.toBe(verifier)
  })
})
