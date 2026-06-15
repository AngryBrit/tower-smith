import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  formatPickerFileIds,
  googleDrivePickerConfigured,
  googlePickerApiKey,
} from './googleDrivePicker'

describe('formatPickerFileIds', () => {
  it('joins unique trimmed IDs with commas for the Picker API', () => {
    expect(formatPickerFileIds([' sheet-a ', 'sheet-b', 'sheet-a', ''])).toBe('sheet-a,sheet-b')
  })
})

describe('googleDrivePickerConfigured', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is false when the picker API key is missing', () => {
    vi.stubEnv('VITE_GOOGLE_PICKER_API_KEY', '')
    expect(googlePickerApiKey()).toBeNull()
    expect(googleDrivePickerConfigured()).toBe(false)
  })

  it('is true when the picker API key is set', () => {
    vi.stubEnv('VITE_GOOGLE_PICKER_API_KEY', 'test-picker-key')
    expect(googlePickerApiKey()).toBe('test-picker-key')
    expect(googleDrivePickerConfigured()).toBe(true)
  })
})
