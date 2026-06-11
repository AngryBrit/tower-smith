import { describe, expect, it } from 'vitest'
import {
  isGoogleSheetsQuotaExceededError,
  summarizeGoogleSheetsApiError,
} from './googleSheetsError'

describe('summarizeGoogleSheetsApiError', () => {
  it('extracts message from Google JSON error body', () => {
    expect(
      summarizeGoogleSheetsApiError(
        '{"error":{"code":400,"message":"Unable to parse range: Sheet1!A:Z","status":"INVALID_ARGUMENT"}}',
      ),
    ).toBe('Unable to parse range: Sheet1!A:Z')
  })

  it('returns plain text as-is', () => {
    expect(summarizeGoogleSheetsApiError('ids_master_empty')).toBe('ids_master_empty')
  })

  it('detects quota exceeded errors', () => {
    expect(
      isGoogleSheetsQuotaExceededError(
        '{"error":{"message":"Quota exceeded for quota metric \'Read requests\'"}}',
      ),
    ).toBe(true)
    expect(isGoogleSheetsQuotaExceededError('ids_master_empty')).toBe(false)
  })
})
