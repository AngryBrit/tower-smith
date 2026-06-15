import { describe, expect, it } from 'vitest'
import { isJsPickerGrantFailure } from './effectivePathsJsPickerFallback'

describe('isJsPickerGrantFailure', () => {
  it('matches JS picker failure reasons', () => {
    expect(isJsPickerGrantFailure('picker_failed')).toBe(true)
    expect(isJsPickerGrantFailure('picker_not_configured')).toBe(true)
  })

  it('does not match user-cancelled or validation errors', () => {
    expect(isJsPickerGrantFailure('cancelled')).toBe(false)
    expect(isJsPickerGrantFailure('wrong_spreadsheet')).toBe(false)
    expect(isJsPickerGrantFailure('gateway_failed')).toBe(false)
  })
})
