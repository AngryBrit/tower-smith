import { useEffect } from 'react'
import type { MainPanel } from '../mainPanelStorage'

export type InpanelTabHotkey = {
  key: string
  panel: MainPanel
  /** When false, this digit is not bound (e.g. modules tab disabled). */
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

/** Switch main in-panel tabs with number keys 1–8 on desktop. */
export function useInpanelTabHotkeys(
  bindings: InpanelTabHotkey[],
  onSelectPanel: (panel: MainPanel) => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (isEditableTarget(e.target)) return
      const binding = bindings.find((b) => b.key === e.key && b.enabled !== false)
      if (!binding) return
      e.preventDefault()
      onSelectPanel(binding.panel)
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [bindings, enabled, onSelectPanel])
}
