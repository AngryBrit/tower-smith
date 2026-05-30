import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'

export type LabHydrationContextValue = {
  hydrated: boolean
  importNotice: string | null
  setImportNotice: Dispatch<SetStateAction<string | null>>
}

export const LabHydrationContext = createContext<LabHydrationContextValue | null>(null)

export function useLabHydration(): LabHydrationContextValue {
  const ctx = useContext(LabHydrationContext)
  if (!ctx) {
    throw new Error('useLabHydration must be used within LabHydrationProvider')
  }
  return ctx
}
