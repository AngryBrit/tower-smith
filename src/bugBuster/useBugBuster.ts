import { useContext } from 'react'
import { BugBusterReactContext, type BugBusterContextValue } from './bugBusterContext'

export function useBugBuster(): BugBusterContextValue {
  const ctx = useContext(BugBusterReactContext)
  if (!ctx) {
    throw new Error('useBugBuster must be used within BugBusterProvider')
  }
  return ctx
}

/** Safe when provider may be absent (e.g. tests). */
export function useBugBusterOptional(): BugBusterContextValue | null {
  return useContext(BugBusterReactContext)
}
