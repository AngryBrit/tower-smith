import type { BugReportCategory } from '../bugReport'
import type { MainPanel } from '../mainPanelStorage'

export type BugBusterInitial = {
  category?: BugReportCategory
  description?: string
  steps?: string
  panelId?: MainPanel
  panelLabel?: string
  error?: Error
  componentStack?: string | null
}
