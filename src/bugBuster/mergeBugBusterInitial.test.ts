import { afterEach, describe, expect, it } from 'vitest'
import { clearCapturedGlobalError } from './globalErrorCapture'
import { mergeBugBusterInitial } from './mergeBugBusterInitial'

describe('mergeBugBusterInitial', () => {
  afterEach(() => {
    clearCapturedGlobalError()
  })

  it('returns null when no initial and no capture', () => {
    expect(mergeBugBusterInitial()).toBeNull()
  })

  it('passes through initial with error', () => {
    const err = new Error('panel')
    expect(
      mergeBugBusterInitial({
        category: 'crash',
        description: 'panel',
        error: err,
      })?.error,
    ).toBe(err)
  })
})
