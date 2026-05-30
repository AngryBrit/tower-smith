import type { LabsShareFile } from '../labsShareCodec'

export type SelectResearchHandle = {
  openLabDataPanel: () => void
  openCompareDialog: () => void
  getLabsShareFile: () => LabsShareFile | null
  applyLabsShareFile: (file: LabsShareFile) => boolean
}

export type PendingLabUiAction = 'dataPanel' | 'compare'
