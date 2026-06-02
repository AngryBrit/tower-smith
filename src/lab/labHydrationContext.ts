import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from 'react'
import type { ImportNotice, ImportNoticeVariant } from '../importNotice'

export type LabHydrationContextValue = {
  hydrated: boolean
  importNotice: ImportNotice | null
  setImportNotice: Dispatch<SetStateAction<ImportNotice | string | null>>
  publishImportNotice: (message: string, variant: ImportNoticeVariant) => void
}

export const LabHydrationContext = createContext<LabHydrationContextValue | null>(null)

export function useLabHydration(): LabHydrationContextValue {
  const ctx = useContext(LabHydrationContext)
  if (!ctx) {
    throw new Error('useLabHydration must be used within LabHydrationProvider')
  }
  return ctx
}
