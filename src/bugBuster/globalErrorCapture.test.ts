/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest'
import {
  __testCaptureGlobalError,
  clearCapturedGlobalError,
  getLastCapturedGlobalError,
  registerBugBusterGlobalErrorHandlers,
} from './globalErrorCapture'

describe('globalErrorCapture', () => {
  afterEach(() => {
    clearCapturedGlobalError()
  })

  it('captures window error events', () => {
    const cleanup = registerBugBusterGlobalErrorHandlers()
    window.dispatchEvent(
      new ErrorEvent('error', { error: new Error('global boom'), message: 'global boom' }),
    )
    cleanup()
    const captured = getLastCapturedGlobalError()
    expect(captured?.error.message).toBe('global boom')
    expect(captured?.source).toBe('error')
  })

  it('captures unhandled rejections', () => {
    __testCaptureGlobalError(new Error('async fail'), 'unhandledrejection')
    expect(getLastCapturedGlobalError()?.error.message).toBe('async fail')
    expect(getLastCapturedGlobalError()?.source).toBe('unhandledrejection')
  })
})
