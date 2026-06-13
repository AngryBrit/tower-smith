import { useCallback, useEffect, useState } from 'react'
import {
  EFFECTIVE_PATHS_SPREADSHEET_REF_CHANGE_EVENT,
  readStoredSpreadsheetRef,
  writeStoredSpreadsheetRef,
} from './effectivePathsStorage'

/** Live view of the per-account IDS Master ref (updates after account cloud sync). */
export function useStoredSpreadsheetRef(userId?: string | null): {
  spreadsheetRef: string
  setSpreadsheetRef: (value: string) => void
  persistSpreadsheetRef: () => void
  reloadSpreadsheetRef: () => void
} {
  const [spreadsheetRef, setSpreadsheetRefState] = useState(() =>
    readStoredSpreadsheetRef(userId),
  )
  const [trackedUserId, setTrackedUserId] = useState(userId)

  if (userId !== trackedUserId) {
    setTrackedUserId(userId)
    setSpreadsheetRefState(readStoredSpreadsheetRef(userId))
  }

  useEffect(() => {
    const onChange = () => {
      setSpreadsheetRefState(readStoredSpreadsheetRef(userId))
    }
    window.addEventListener(EFFECTIVE_PATHS_SPREADSHEET_REF_CHANGE_EVENT, onChange)
    return () => {
      window.removeEventListener(EFFECTIVE_PATHS_SPREADSHEET_REF_CHANGE_EVENT, onChange)
    }
  }, [userId])

  const setSpreadsheetRef = useCallback(
    (value: string) => {
      setSpreadsheetRefState(value)
      writeStoredSpreadsheetRef(value, userId)
    },
    [userId],
  )

  const persistSpreadsheetRef = useCallback(() => {
    writeStoredSpreadsheetRef(spreadsheetRef, userId)
  }, [spreadsheetRef, userId])

  const reloadSpreadsheetRef = useCallback(() => {
    setSpreadsheetRefState(readStoredSpreadsheetRef(userId))
  }, [userId])

  return { spreadsheetRef, setSpreadsheetRef, persistSpreadsheetRef, reloadSpreadsheetRef }
}
