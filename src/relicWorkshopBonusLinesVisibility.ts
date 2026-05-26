import { useCallback, useEffect, useState } from 'react'

export const RELIC_WORKSHOP_BONUS_LINES_VISIBLE_STORAGE_KEY =
  'tower-export-relic-workshop-bonus-lines-visible-v1'

const CHANGE_EVENT = 'tower-export-relic-workshop-bonus-lines-visible-change'

export function readRelicWorkshopBonusLinesVisible(): boolean {
  try {
    return localStorage.getItem(RELIC_WORKSHOP_BONUS_LINES_VISIBLE_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function writeRelicWorkshopBonusLinesVisible(visible: boolean): void {
  try {
    localStorage.setItem(
      RELIC_WORKSHOP_BONUS_LINES_VISIBLE_STORAGE_KEY,
      visible ? '1' : '0',
    )
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

export function useRelicWorkshopBonusLinesVisible(): [boolean, (visible: boolean) => void] {
  const [visible, setVisible] = useState(readRelicWorkshopBonusLinesVisible)

  useEffect(() => {
    const sync = () => setVisible(readRelicWorkshopBonusLinesVisible())
    window.addEventListener(CHANGE_EVENT, sync)
    const onStorage = (e: StorageEvent) => {
      if (e.key === RELIC_WORKSHOP_BONUS_LINES_VISIBLE_STORAGE_KEY || e.key === null) {
        sync()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const setRelicWorkshopBonusLinesVisible = useCallback((next: boolean) => {
    writeRelicWorkshopBonusLinesVisible(next)
    setVisible(next)
  }, [])

  return [visible, setRelicWorkshopBonusLinesVisible]
}
