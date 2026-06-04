/** @vitest-environment jsdom */
import { renderHook, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useHoldStepper } from './useHoldStepper'

describe('useHoldStepper', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls onStep on short pointer tap', () => {
    const onStep = vi.fn()
    const onHold = vi.fn()
    const { result } = renderHook(() =>
      useHoldStepper({ enabled: true, onStep, onHold }),
    )

    act(() => {
      result.current.onPointerDown()
      result.current.onPointerUp()
    })

    expect(onStep).toHaveBeenCalledTimes(1)
    expect(onHold).not.toHaveBeenCalled()
  })

  it('calls onHold after hold duration', () => {
    const onStep = vi.fn()
    const onHold = vi.fn()
    const { result } = renderHook(() =>
      useHoldStepper({ enabled: true, onStep, onHold, holdMs: 400 }),
    )

    act(() => {
      result.current.onPointerDown()
      vi.advanceTimersByTime(400)
      result.current.onPointerUp()
    })

    expect(onHold).toHaveBeenCalledTimes(1)
    expect(onStep).not.toHaveBeenCalled()
  })

  it('cancels hold when pointer leaves before release', () => {
    const onStep = vi.fn()
    const onHold = vi.fn()
    const { result } = renderHook(() =>
      useHoldStepper({ enabled: true, onStep, onHold }),
    )

    act(() => {
      result.current.onPointerDown()
      result.current.onPointerLeave()
      result.current.onPointerUp()
    })

    expect(onStep).not.toHaveBeenCalled()
    expect(onHold).not.toHaveBeenCalled()
  })
})
