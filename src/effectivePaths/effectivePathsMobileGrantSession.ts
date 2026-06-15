import type { EnsureEffectivePathsSpreadsheetAccessTitles } from './grantEffectivePathsSpreadsheetAccess'

const PKCE_SESSION_KEY = 'towersmith_ep_mobile_pkce'
const FLOW_SESSION_KEY = 'towersmith_ep_mobile_grant_flow'
const RESUME_SESSION_KEY = 'towersmith_ep_mobile_resume'

export type EpMobileGrantPhase = 'master' | 'all_workbooks' | 'linked_workbooks'

export type EpMobileGrantFlow = {
  phase: EpMobileGrantPhase
  masterSpreadsheetId: string
  masterSheetGid: number | null
  spreadsheetIds: string[]
  multiselect: boolean
  requireMasterSpreadsheetId?: string
  titles: EnsureEffectivePathsSpreadsheetAccessTitles
  returnPath: string
  oauthState: string
  codeVerifier: string
}

export type EpMobilePkceSession = {
  oauthState: string
  codeVerifier: string
}

export type EpMobileResumePayload = {
  accessToken: string
  expiresInSec?: number
  pickedSpreadsheetIds: string[]
  phase: EpMobileGrantPhase
  masterSpreadsheetId: string
  masterSheetGid: number | null
  requireMasterSpreadsheetId?: string
  titles: EnsureEffectivePathsSpreadsheetAccessTitles
}

function readJson<T>(key: string): T | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    sessionStorage.removeItem(key)
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(key, JSON.stringify(value))
}

export function stashEpMobilePkceSession(session: EpMobilePkceSession): void {
  writeJson(PKCE_SESSION_KEY, session)
}

export function readEpMobilePkceSession(): EpMobilePkceSession | null {
  return readJson<EpMobilePkceSession>(PKCE_SESSION_KEY)
}

export function clearEpMobilePkceSession(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(PKCE_SESSION_KEY)
}

export function stashEpMobileGrantFlow(flow: EpMobileGrantFlow): void {
  writeJson(FLOW_SESSION_KEY, flow)
  stashEpMobilePkceSession({
    oauthState: flow.oauthState,
    codeVerifier: flow.codeVerifier,
  })
}

export function readEpMobileGrantFlow(): EpMobileGrantFlow | null {
  return readJson<EpMobileGrantFlow>(FLOW_SESSION_KEY)
}

export function clearEpMobileGrantFlow(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(FLOW_SESSION_KEY)
  clearEpMobilePkceSession()
}

export function stashEpMobileResume(payload: EpMobileResumePayload): void {
  writeJson(RESUME_SESSION_KEY, payload)
}

export function consumeEpMobileResume(): EpMobileResumePayload | null {
  if (typeof sessionStorage === 'undefined') return null
  const payload = readJson<EpMobileResumePayload>(RESUME_SESSION_KEY)
  sessionStorage.removeItem(RESUME_SESSION_KEY)
  return payload
}

const ERROR_SESSION_KEY = 'towersmith_ep_mobile_picker_error'

export function stashEpMobilePickerError(reason: string): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(ERROR_SESSION_KEY, reason)
}

export function consumeEpMobilePickerError(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  const reason = sessionStorage.getItem(ERROR_SESSION_KEY)
  sessionStorage.removeItem(ERROR_SESSION_KEY)
  return reason
}

export function peekEpMobilePickerError(): string | null {
  if (typeof sessionStorage === 'undefined') return null
  return sessionStorage.getItem(ERROR_SESSION_KEY)
}

export function peekEpMobileResume(): EpMobileResumePayload | null {
  return readJson<EpMobileResumePayload>(RESUME_SESSION_KEY)
}
