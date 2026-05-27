export type MainPanel =
  | 'research'
  | 'workshop'
  | 'bots'
  | 'modules'
  | 'cards'
  | 'relics'
  | 'themes'
  | 'gallery'
  | 'toolsSettings'

export const MAIN_PANEL_STORAGE_KEY = 'tower-export-main-panel-v1'

const MAIN_PANELS: readonly MainPanel[] = [
  'research',
  'workshop',
  'bots',
  'modules',
  'cards',
  'relics',
  'themes',
  'gallery',
  'toolsSettings',
]

export const DEFAULT_MAIN_PANEL: MainPanel = 'workshop'

export function sanitizeMainPanel(
  raw: unknown,
  modulesPanelEnabled: boolean,
): MainPanel {
  if (typeof raw !== 'string') return DEFAULT_MAIN_PANEL
  if (raw === 'galleryAdmin') return 'toolsSettings'
  if (!(MAIN_PANELS as readonly string[]).includes(raw)) return DEFAULT_MAIN_PANEL
  const panel = raw as MainPanel
  if (panel === 'modules' && !modulesPanelEnabled) return 'workshop'
  return panel
}

export function readMainPanel(modulesPanelEnabled: boolean): MainPanel {
  try {
    const raw = localStorage.getItem(MAIN_PANEL_STORAGE_KEY)
    if (!raw) return DEFAULT_MAIN_PANEL
    return sanitizeMainPanel(raw, modulesPanelEnabled)
  } catch {
    return DEFAULT_MAIN_PANEL
  }
}

export function writeMainPanel(panel: MainPanel): void {
  try {
    localStorage.setItem(MAIN_PANEL_STORAGE_KEY, panel)
  } catch {
    /* ignore quota / private mode */
  }
}
