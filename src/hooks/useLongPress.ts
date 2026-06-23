import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react'

const DEFAULT_LONG_PRESS_MS = 500

/**
 * Pointer long-press: short release calls onShortPress; hold past delay calls onLongPress once.
 * Suppresses the short press after a long press until pointer cycle ends.
 */
export function useLongPress(options: {
  enabled?: boolean
  longPressEnabled?: boolean
  delayMs?: number
  onLongPress: () => void
  onShortPress?: () => void
}) {
  const {
    enabled = true,
    longPressEnabled = true,
    delayMs = DEFAULT_LONG_PRESS_MS,
    onLongPress,
    onShortPress,
  } = options
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPressRef = useRef(false)
  const pointerCancelledRef = useRef(false)
  const handledByPointerRef = useRef(false)

  function clearTimer() {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => () => clearTimer(), [])

  return {
    onPointerDown(e: PointerEvent) {
      if (!enabled || e.button !== 0) return
      handledByPointerRef.current = true
      pointerCancelledRef.current = false
      didLongPressRef.current = false
      clearTimer()
      if (!longPressEnabled) return
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        didLongPressRef.current = true
        onLongPress()
      }, delayMs)
    },
    onPointerLeave() {
      clearTimer()
      pointerCancelledRef.current = true
    },
    onPointerUp() {
      clearTimer()
      if (!enabled || pointerCancelledRef.current) {
        didLongPressRef.current = false
        return
      }
      if (!didLongPressRef.current) {
        onShortPress?.()
      }
      didLongPressRef.current = false
    },
    onPointerCancel() {
      clearTimer()
      pointerCancelledRef.current = true
      didLongPressRef.current = false
    },
    onClick() {
      if (handledByPointerRef.current) {
        handledByPointerRef.current = false
        return
      }
      if (enabled) {
        onShortPress?.()
      }
    },
    onContextMenu(e: MouseEvent) {
      if (!enabled) return
      e.preventDefault()
    },
  }
}
