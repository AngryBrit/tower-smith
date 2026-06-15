import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildMobilePickerAuthUrl } from './googleDrivePickerMobile'
import { googlePickerOAuthRedirectUri } from './googleDrivePickerEnvironment'

describe('buildMobilePickerAuthUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('includes one-pick OAuth parameters and comma-separated file IDs', async () => {
    vi.stubEnv('VITE_GOOGLE_SHEETS_OAUTH_CLIENT_ID', 'test-client.apps.googleusercontent.com')

    const url = await buildMobilePickerAuthUrl({
      spreadsheetIds: ['sheet-a', 'sheet-b'],
      phase: 'all_workbooks',
      masterSpreadsheetId: 'sheet-a',
      masterSheetGid: null,
      multiselect: true,
      titles: {
        idsMaster: 'IDS',
        allWorkbooks: 'All',
        linkedWorkbooks: 'Linked',
      },
      oauthState: 'state-123',
      codeVerifier: 'verifier-123',
      redirectUri: googlePickerOAuthRedirectUri('https://www.towersmith.com'),
    })

    expect(url).toBeTruthy()
    const parsed = new URL(url!)
    expect(parsed.origin).toBe('https://accounts.google.com')
    expect(parsed.searchParams.get('trigger_onepick')).toBe('true')
    expect(parsed.searchParams.get('file_ids')).toBe('sheet-a,sheet-b')
    expect(parsed.searchParams.get('allow_multiple')).toBe('true')
    expect(parsed.searchParams.get('code_challenge_method')).toBe('S256')
    expect(parsed.searchParams.get('redirect_uri')).toBe(
      'https://www.towersmith.com/oauth/google-drive-picker',
    )
  })
})
