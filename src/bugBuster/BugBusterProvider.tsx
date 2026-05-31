import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { MainPanel } from '../mainPanelStorage'
import { BugBusterReactContext } from './bugBusterContext'
import type { BugBusterInitial } from './bugBusterTypes'
import { registerBugBusterGlobalErrorHandlers } from './globalErrorCapture'
import { mergeBugBusterInitial } from './mergeBugBusterInitial'

export function BugBusterProvider({
  mainPanel,
  children,
}: {
  mainPanel: MainPanel
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [sessionId, setSessionId] = useState(0)
  const [initial, setInitial] = useState<BugBusterInitial | null>(null)

  const openBugBuster = useCallback((next?: BugBusterInitial) => {
    setInitial(mergeBugBusterInitial(next))
    setSessionId((id) => id + 1)
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
      sessionId,
      initial,
      mainPanel,
      openBugBuster,
      closeBugBuster,
    }),
    [closeBugBuster, initial, mainPanel, open, openBugBuster, sessionId],
  )

  return <BugBusterReactContext.Provider value={value}>{children}</BugBusterReactContext.Provider>
}
