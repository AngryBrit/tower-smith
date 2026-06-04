import { useEffect, useRef } from 'react'

const DEFAULT_HOLD_MS = 500

/**
 * Stepper control: tap steps once; hold triggers onHold (e.g. min/max).
 * Pointer path suppresses duplicate click from mouse/touch.
 */
export function useHoldStepper(options: {
  enabled: boolean
  onHold: () => void
  onStep: () => void
  holdMs?: number
}) {
  const { enabled, onHold, onStep, holdMs = DEFAULT_HOLD_MS } = options
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didHoldRef = useRef(false)
  const pointerCancelledRef = useRef(false)
  const handledByPointerRef = useRef(false)

  function clearHoldTimer() {
    if (holdTimerRef.current != null) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }

  useEffect(() => () => clearHoldTimer(), [])

  return {
    onPointerDown() {
      if (!enabled) return
      handledByPointerRef.current = true
      pointerCancelledRef.current = false
      didHoldRef.current = false
      clearHoldTimer()
      holdTimerRef.current = setTimeout(() => {
        holdTimerRef.current = null
        didHoldRef.current = true
        onHold()
      }, holdMs)
    },
    onPointerLeave() {
      clearHoldTimer()
      pointerCancelledRef.current = true
    },
    onPointerUp() {
      clearHoldTimer()
      if (!enabled || pointerCancelledRef.current) {
        didHoldRef.current = false
        return
      }
      if (!didHoldRef.current) {
        onStep()
      }
      didHoldRef.current = false
    },
    onPointerCancel() {
      clearHoldTimer()
      pointerCancelledRef.current = true
      didHoldRef.current = false
    },
    onClick() {
      if (handledByPointerRef.current) {
        handledByPointerRef.current = false
        return
      }
      if (enabled) {
        onStep()
      }
    },
  }
}
