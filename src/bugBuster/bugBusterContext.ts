import { createContext } from 'react'
import type { MainPanel } from '../mainPanelStorage'
import type { BugBusterInitial } from './bugBusterTypes'

export type BugBusterContextValue = {
  open: boolean
  /** Bumped on each open so the dialog form remounts with fresh state. */
  sessionId: number
  initial: BugBusterInitial | null
  mainPanel: MainPanel
  openBugBuster: (initial?: BugBusterInitial) => void
  closeBugBuster: () => void
}

export const BugBusterReactContext = createContext<BugBusterContextValue | null>(null)
