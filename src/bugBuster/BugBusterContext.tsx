import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { BugReportCategory } from '../bugReport'
import type { MainPanel } from '../mainPanelStorage'
import { registerBugBusterGlobalErrorHandlers } from './globalErrorCapture'
import { mergeBugBusterInitial } from './mergeBugBusterInitial'

export type BugBusterInitial = {
  category?: BugReportCategory
  description?: string
  steps?: string
  panelId?: MainPanel
  panelLabel?: string
  error?: Error
  componentStack?: string | null
}

type BugBusterContextValue = {
  open: boolean
  initial: BugBusterInitial | null
  mainPanel: MainPanel
  openBugBuster: (initial?: BugBusterInitial) => void
  closeBugBuster: () => void
}

const BugBusterContext = createContext<BugBusterContextValue | null>(null)

export function BugBusterProvider({
  mainPanel,
  children,
}: {
  mainPanel: MainPanel
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [initial, setInitial] = useState<BugBusterInitial | null>(null)

  const openBugBuster = useCallback((next?: BugBusterInitial) => {
    setInitial(mergeBugBusterInitial(next))
    setOpen(true)
  }, [])

  useEffect(() => registerBugBusterGlobalErrorHandlers(), [])

  const closeBugBuster = useCallback(() => {
    setOpen(false)
    setInitial(null)
  }, [])

  const value = useMemo(
    () => ({
      open,
      initial,
      mainPanel,
      openBugBuster,
      closeBugBuster,
    }),
    [closeBugBuster, initial, mainPanel, open, openBugBuster],
  )

  return <BugBusterContext.Provider value={value}>{children}</BugBusterContext.Provider>
}

export function useBugBuster(): BugBusterContextValue {
  const ctx = useContext(BugBusterContext)
  if (!ctx) {
    throw new Error('useBugBuster must be used within BugBusterProvider')
  }
  return ctx
}

/** Safe when provider may be absent (e.g. tests). */
export function useBugBusterOptional(): BugBusterContextValue | null {
  return useContext(BugBusterContext)
}
