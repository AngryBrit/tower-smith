import { describe, expect, it } from 'vitest'
import { accountWorkspaceErrorMessage } from './syncErrorMessage'

describe('accountWorkspaceErrorMessage', () => {
  const t = (key: string) => key

  it('maps auth errors', () => {
    expect(accountWorkspaceErrorMessage(t, 'invalid_token')).toBe(
      'sr_notice_account_sync_auth_failed',
    )
  })

  it('maps storage errors', () => {
    expect(accountWorkspaceErrorMessage(t, 'storage_unavailable')).toBe(
      'sr_notice_account_sync_storage_failed',
    )
  })
})
