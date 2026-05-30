import { useEffect, type RefObject } from 'react'

export type UseSearchHotkeyOptions = {
  /** When set, only focus search if this tabpanel is visible (not `hidden`). */
  panelId?: string
  enabled?: boolean
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}

/** Focus the search field when the user presses `/` outside text inputs. */
export function useSearchHotkey(
  searchInputRef: RefObject<HTMLInputElement | null>,
  options: UseSearchHotkeyOptions = {},
) {
  const { panelId, enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    const onDocKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.repeat) return
      if (panelId) {
        const panel = document.getElementById(panelId)
        if (!panel || panel.hidden) return
      }
      if (e.target === searchInputRef.current) return
      if (isEditableTarget(e.target)) return
      e.preventDefault()
      const el = searchInputRef.current
      if (!el) return
      el.focus()
      el.select()
    }

    document.addEventListener('keydown', onDocKeyDown)
    return () => document.removeEventListener('keydown', onDocKeyDown)
  }, [enabled, panelId, searchInputRef])
}
