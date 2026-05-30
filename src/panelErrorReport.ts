import { APP_VERSION } from './appVersion'
import type { MainPanel } from './mainPanelStorage'

export type PanelErrorReportInput = {
  panelId: MainPanel
  panelLabel: string
  error: Error
  componentStack?: string | null
}

export function buildPanelErrorReport({
  panelId,
  panelLabel,
  error,
  componentStack,
}: PanelErrorReportInput): string {
  const lines = [
    `TowerSmith v${APP_VERSION}`,
    `Panel: ${panelLabel} (${panelId})`,
    typeof window !== 'undefined' ? `URL: ${window.location.href}` : '',
    `Error: ${error.message}`,
  ].filter(Boolean)

  if (error.stack) {
    lines.push('', error.stack.trim())
  }
  if (componentStack?.trim()) {
    lines.push('', 'Component stack:', componentStack.trim())
  }

  return lines.join('\n')
}
