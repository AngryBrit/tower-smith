import type { WorkshopAssistModuleSlot } from './workshopSimModules'

const base = import.meta.env.BASE_URL

/** Central tower graphic (`public/modules/The Tower_1.webp`). */
export const WORKSHOP_MODULES_TOWER_IMAGE = `${base}modules/The%20Tower_1.webp`

export type ModuleHubPlacement = 'tl' | 'tr' | 'bl' | 'br'

export type ModuleHubShape = 'circle' | 'triangle' | 'octagon' | 'diamond'

/** SVG geometry for hub slot outlines (viewBox 0 0 100 100). */
export const MODULE_FRAME_SHAPE: Record<
  ModuleHubShape,
  { type: 'circle'; r: number } | { type: 'polygon'; points: string }
> = {
  circle: { type: 'circle', r: 46 },
  triangle: { type: 'polygon', points: '50,4 6,92 94,92' },
  octagon: { type: 'polygon', points: '30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30' },
  diamond: { type: 'polygon', points: '50,4 96,50 50,96 4,50' },
}

export type ModuleHubAssistSide = 'before' | 'after'

export type ModuleHubSlotArt = {
  placement: ModuleHubPlacement
  shape: ModuleHubShape
  glowRgb: string
  /** Assist frame sits before (left/top-outer) or after (right/top-outer) the main frame. */
  assistSide: ModuleHubAssistSide
}

/** In-game hub slot frames (icons TBD). */
export const MODULE_HUB_SLOT_ART: Record<WorkshopAssistModuleSlot, ModuleHubSlotArt> = {
  cannon: {
    placement: 'tl',
    shape: 'circle',
    glowRgb: '244, 63, 94',
    assistSide: 'before',
  },
  armor: {
    placement: 'bl',
    shape: 'octagon',
    glowRgb: '236, 72, 153',
    assistSide: 'before',
  },
  generator: {
    placement: 'tr',
    shape: 'triangle',
    glowRgb: '245, 158, 11',
    assistSide: 'after',
  },
  core: {
    placement: 'br',
    shape: 'diamond',
    glowRgb: '251, 146, 60',
    assistSide: 'after',
  },
}
