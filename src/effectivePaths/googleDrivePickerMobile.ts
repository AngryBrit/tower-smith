import { currentAppUrl } from '../devOrigin'
import { DRIVE_FILE_SCOPE, formatPickerFileIds } from './googleDrivePicker'
import { shouldUsePickerOAuthRedirectFlow, googlePickerOAuthRedirectUri } from './googleDrivePickerEnvironment'
import { createGoogleSheetsOAuthState } from './googleSheetsOAuthState'
import { writeCachedSheetsToken } from './googleSheetsOAuth'
import { createPkceChallenge, createPkceVerifier } from './googlePkce'
import {
  clearEpMobileGrantFlow,
  readEpMobileGrantFlow,
  stashEpMobileGrantFlow,
  stashEpMobileResume,
  urlWithEpResumeFlag,
  type EpMobileGrantFlow,
  type EpMobileGrantPhase,
} from './effectivePathsMobileGrantSession'

const SPREADSHEET_MIME = 'application/vnd.google-apps.spreadsheet'
const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'

export type MobilePickerRedirectOptions = {
  spreadsheetIds: readonly string[]
  multiselect?: boolean
  phase: EpMobileGrantPhase
  masterSpreadsheetId: string
  masterSheetGid: number | null
  requireMasterSpreadsheetId?: string
  titles: EpMobileGrantFlow['titles']
  returnPath?: string
}

export type MobilePickerCallbackResult =
  | { ok: true; returnPath: string }
  | {
      ok: false
      reason: 'cancelled' | 'state_mismatch' | 'token_exchange_failed' | 'missing_flow'
      returnPath: string
    }

function oauthClientId(): string | null {
  const id = import.meta.env.VITE_GOOGLE_SHEETS_OAUTH_CLIENT_ID
  return typeof id === 'string' && id.trim().length > 0 ? id.trim() : null
}

function returnPathFromLocation(): string {
  return currentAppUrl()
}

function failureResult(
  reason: Extract<MobilePickerCallbackResult, { ok: false }>['reason'],
  returnPath: string,
): MobilePickerCallbackResult {
  return { ok: false, reason, returnPath: urlWithEpResumeFlag(returnPath) }
}

export async function buildMobilePickerAuthUrl(
  options: MobilePickerRedirectOptions & {
    oauthState: string
    codeVerifier: string
    redirectUri: string
  },
): Promise<string | null> {
  const clientId = oauthClientId()
  if (!clientId) return null

  const fileIds = formatPickerFileIds(options.spreadsheetIds)
  if (!fileIds) return null

  const codeChallenge = await createPkceChallenge(options.codeVerifier)
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: options.redirectUri,
    response_type: 'code',
    scope: DRIVE_FILE_SCOPE,
    prompt: 'consent',
    trigger_onepick: 'true',
    file_ids: fileIds,
    mimetypes: SPREADSHEET_MIME,
    state: options.oauthState,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  if (options.multiselect !== false) {
    params.set('allow_multiple', 'true')
  }
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`
}

/** Redirect the browser to Google's mobile one-pick OAuth flow (does not return). */
export async function redirectToMobilePickerAuth(
  options: MobilePickerRedirectOptions,
): Promise<void> {
  const oauthState = createGoogleSheetsOAuthState()
  const codeVerifier = createPkceVerifier()
  const redirectUri = googlePickerOAuthRedirectUri()
  const flow: EpMobileGrantFlow = {
    phase: options.phase,
    masterSpreadsheetId: options.masterSpreadsheetId,
    masterSheetGid: options.masterSheetGid,
    spreadsheetIds: [...options.spreadsheetIds],
    multiselect: options.multiselect ?? options.spreadsheetIds.length > 1,
    requireMasterSpreadsheetId: options.requireMasterSpreadsheetId,
    titles: options.titles,
    returnPath: options.returnPath ?? returnPathFromLocation(),
    oauthState,
    codeVerifier,
  }
  stashEpMobileGrantFlow(flow)

  const authUrl = await buildMobilePickerAuthUrl({
    ...options,
    oauthState,
    codeVerifier,
    redirectUri,
  })
  if (!authUrl) {
    clearEpMobileGrantFlow()
    throw new Error('google_picker_mobile_not_configured')
  }
  window.location.assign(authUrl)
}

export function mobilePickerRedirectPreferred(): boolean {
  return shouldUsePickerOAuthRedirectFlow()
}

async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<{ accessToken: string; expiresInSec?: number } | null> {
  const clientId = oauthClientId()
  if (!clientId) return null

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  })

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!response.ok) return null

  const json = (await response.json()) as { access_token?: string; expires_in?: number }
  if (!json.access_token) return null
  return {
    accessToken: json.access_token,
    expiresInSec: json.expires_in,
  }
}

function parsePickedFileIds(params: URLSearchParams): string[] {
  const raw = params.get('picked_file_ids')
  if (!raw) return []
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
}

/** Handle `/oauth/google-drive-picker` callback before the SPA boots. */
export async function completeMobilePickerOAuthCallback(
  searchParams: URLSearchParams,
): Promise<MobilePickerCallbackResult> {
  const flow = readEpMobileGrantFlow()
  const fallbackReturnPath = flow?.returnPath ?? currentAppUrl()
  if (!flow) {
    return failureResult('missing_flow', fallbackReturnPath)
  }

  const returnedState = searchParams.get('state')
  if (!returnedState || returnedState !== flow.oauthState) {
    clearEpMobileGrantFlow()
    return failureResult('state_mismatch', flow.returnPath)
  }

  if (searchParams.get('error')) {
    clearEpMobileGrantFlow()
    return failureResult('cancelled', flow.returnPath)
  }

  const code = searchParams.get('code')
  if (!code) {
    clearEpMobileGrantFlow()
    return failureResult('token_exchange_failed', flow.returnPath)
  }

  const redirectUri = googlePickerOAuthRedirectUri()
  const tokenResult = await exchangeAuthorizationCode(code, flow.codeVerifier, redirectUri)
  if (!tokenResult) {
    clearEpMobileGrantFlow()
    return failureResult('token_exchange_failed', flow.returnPath)
  }

  writeCachedSheetsToken(tokenResult.accessToken, tokenResult.expiresInSec)

  const returnPath = flow.returnPath
  stashEpMobileResume({
    accessToken: tokenResult.accessToken,
    expiresInSec: tokenResult.expiresInSec,
    pickedSpreadsheetIds: parsePickedFileIds(searchParams),
    phase: flow.phase,
    masterSpreadsheetId: flow.masterSpreadsheetId,
    masterSheetGid: flow.masterSheetGid,
    requireMasterSpreadsheetId: flow.requireMasterSpreadsheetId,
    titles: flow.titles,
  })
  clearEpMobileGrantFlow()

  return { ok: true, returnPath: urlWithEpResumeFlag(returnPath) }
}
