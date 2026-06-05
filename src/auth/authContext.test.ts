import { describe, expect, it } from 'vitest'
import type { User } from '@supabase/supabase-js'
import { avatarUrlFromUser, resolveAuthAvatarUrl } from './authContext'

function userWithMeta(meta: Record<string, unknown>): User {
  return { user_metadata: meta } as User
}

describe('avatarUrlFromUser', () => {
  it('reads Google picture from OAuth metadata', () => {
    expect(
      avatarUrlFromUser(
        userWithMeta({ picture: 'https://example.com/google.jpg' }),
      ),
    ).toBe('https://example.com/google.jpg')
  })
})

describe('resolveAuthAvatarUrl', () => {
  const googleUser = userWithMeta({ picture: 'https://example.com/google.jpg' })

  it('returns null while profile is loading', () => {
    expect(resolveAuthAvatarUrl(googleUser, false, 'https://example.com/custom.jpg')).toBeNull()
  })

  it('uses profile avatar when set', () => {
    expect(
      resolveAuthAvatarUrl(googleUser, true, 'https://example.com/custom.jpg'),
    ).toBe('https://example.com/custom.jpg')
  })

  it('does not fall back to OAuth metadata after profile avatar is cleared', () => {
    expect(resolveAuthAvatarUrl(googleUser, true, null)).toBeNull()
  })
})
