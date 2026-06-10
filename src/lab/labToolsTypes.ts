import type { LabsShareFile } from '../labsShareCodec'

/** Optional preset when opening the compare dialog (e.g. from gallery browse). */
export type CompareDialogInit = {
  /** Side B text: gallery URL, CSV, share payload, etc. */
  textB: string
  labelA?: string
  labelB?: string
  /** Insert current tower CSV into side A on open. */
  fillCurrentA?: boolean
  /** Run compare once inputs are applied. */
  autoRun?: boolean
}

export type SelectResearchHandle = {
  openLabDataPanel: () => void
  openCompareDialog: (init?: CompareDialogInit) => void
  getLabsShareFile: () => LabsShareFile | null
  applyLabsShareFile: (file: LabsShareFile) => boolean
}

export type PendingLabUiAction = 'dataPanel' | 'compare'
