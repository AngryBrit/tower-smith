import type { WorkshopAssistModuleSlot } from '../data/workshopSimModules'

/** Modules v6.1.2 Inventory tab — 0-based column index for each module block (stride 5). */
export const MODULE_EP_INVENTORY_MODULE_BASE_COLS = [5, 10, 15, 20, 25, 30, 35, 40] as const

/** Cannon substat rows must not extend into the armor section (header row 8). */
export const MODULE_EP_CANNON_MAX_SUBSTAT_ROW = 7

/**
 * Modules v6.1.2 Inventory substat dropdown bands (Dropdown Export.tsv).
 * Compact Inventory stacks module data at the top but formulas still read these rows.
 */
export const MODULE_EP_INVENTORY_SUBSTAT_BANDS: Record<
  WorkshopAssistModuleSlot,
  { substatStartRow: number; substatEndRow: number; spareRow: number }
> = {
  cannon: { substatStartRow: 7, substatEndRow: 14, spareRow: 3 },
  armor: { substatStartRow: 20, substatEndRow: 27, spareRow: 16 },
  generator: { substatStartRow: 33, substatEndRow: 40, spareRow: 29 },
  core: { substatStartRow: 46, substatEndRow: 53, spareRow: 42 },
}

export type ModuleEpInventoryModuleColumn = {
  moduleId: string
  baseCol: number
}

export type ModuleEpInventorySection = {
  slot: WorkshopAssistModuleSlot
  /** 1-based sheet row with rarity / level / stat for equipped modules. */
  dataRow: number
  /** 1-based sheet row for assist “Spare …” dropdown (Any Other column). */
  spareRow: number
  /** 1-based sheet row where the first substat name is written (main columns). */
  substatStartRow: number
  modules: readonly ModuleEpInventoryModuleColumn[]
}

/** Sheet column order (left → right); indices 6–7 are Any Other placeholders. */
export const MODULE_EP_INVENTORY_SECTIONS: Record<WorkshopAssistModuleSlot, ModuleEpInventorySection> = {
  cannon: {
    slot: 'cannon',
    dataRow: 2,
    spareRow: 3,
    substatStartRow: 3,
    modules: [
      { moduleId: 'astralDeliverance', baseCol: 5 },
      { moduleId: 'beingAnnihilator', baseCol: 10 },
      { moduleId: 'deathPenalty', baseCol: 15 },
      { moduleId: 'havocBringer', baseCol: 20 },
      { moduleId: 'shrinkRay', baseCol: 25 },
      { moduleId: 'amplifyingStrike', baseCol: 30 },
      { moduleId: '__anyOther1', baseCol: 35 },
      { moduleId: '__anyOther2', baseCol: 40 },
    ],
  },
  armor: {
    slot: 'armor',
    dataRow: 10,
    spareRow: 16,
    substatStartRow: 20,
    modules: [
      { moduleId: 'antiCubePortal', baseCol: 5 },
      { moduleId: 'negativeMassProjector', baseCol: 10 },
      { moduleId: 'spaceDisplacer', baseCol: 15 },
      { moduleId: 'wormholeRedirector', baseCol: 20 },
      { moduleId: 'sharpFortitude', baseCol: 25 },
      { moduleId: 'orbitalAugment', baseCol: 30 },
      { moduleId: '__anyOther1', baseCol: 35 },
      { moduleId: '__anyOther2', baseCol: 40 },
    ],
  },
  generator: {
    slot: 'generator',
    dataRow: 15,
    spareRow: 29,
    substatStartRow: 33,
    modules: [
      { moduleId: 'blackHoleDigestor', baseCol: 5 },
      { moduleId: 'galaxyCompressor', baseCol: 10 },
      { moduleId: 'singularityHarness', baseCol: 15 },
      { moduleId: 'pulsarHarvester', baseCol: 20 },
      { moduleId: 'projectFunding', baseCol: 25 },
      { moduleId: 'restorativeBonus', baseCol: 30 },
      { moduleId: '__anyOther1', baseCol: 35 },
      { moduleId: '__anyOther2', baseCol: 40 },
    ],
  },
  core: {
    slot: 'core',
    dataRow: 19,
    spareRow: 42,
    substatStartRow: 46,
    modules: [
      { moduleId: 'multiverseNexus', baseCol: 5 },
      { moduleId: 'dimensionCore', baseCol: 10 },
      { moduleId: 'harmonyConductor', baseCol: 15 },
      { moduleId: 'omChip', baseCol: 20 },
      { moduleId: 'magneticHook', baseCol: 25 },
      { moduleId: 'primordialCollapse', baseCol: 30 },
      { moduleId: '__anyOther1', baseCol: 35 },
      { moduleId: '__anyOther2', baseCol: 40 },
    ],
  },
}

export const MODULE_EP_INVENTORY_SUBSTAT_ROWS = 8

export function moduleEpInventorySlotForModuleId(moduleId: string): WorkshopAssistModuleSlot | null {
  for (const slot of Object.keys(MODULE_EP_INVENTORY_SECTIONS) as WorkshopAssistModuleSlot[]) {
    if (moduleEpInventoryColumnForModuleId(slot, moduleId)) return slot
  }
  return null
}

export function moduleEpInventoryColumnForModuleId(
  slot: WorkshopAssistModuleSlot,
  moduleId: string,
): ModuleEpInventoryModuleColumn | null {
  const section = MODULE_EP_INVENTORY_SECTIONS[slot]
  return section.modules.find((entry) => entry.moduleId === moduleId) ?? null
}

export function moduleEpInventoryAnyOtherColumn(
  slot: WorkshopAssistModuleSlot,
  which: 1 | 2 = 1,
): ModuleEpInventoryModuleColumn {
  const section = MODULE_EP_INVENTORY_SECTIONS[slot]
  const moduleId = which === 1 ? '__anyOther1' : '__anyOther2'
  return section.modules.find((entry) => entry.moduleId === moduleId)!
}
