/**
 * Row order for game `ModuleManager.effects` sparse table (330 entries).
 * Cannon/armor/generator follow wiki catalog order; core follows SubstatsCluster enum
 * with in-game row order verified against playerInfo.dat equipped indices 220/252/282/311.
 */
import { WORKSHOP_SUBMODULE_SECTIONS } from '../../src/data/workshopSubmoduleCatalog.ts'

/** @param {string} label */
function coreRow(label) {
  const row = WORKSHOP_SUBMODULE_SECTIONS.core.rows.find((r) => r.label === label)
  if (!row) throw new Error(`Missing core submodule row: ${label}`)
  return row
}

/** Core rows in game table order (not wiki catalog order). */
export const CORE_GAME_EFFECT_ROWS = [
  'Chain Lightning - Damage [x]',
  'Chain Lightning - Quantity',
  'Chain Lightning - Chance [%]',
  'Smart Missiles - Damage',
  'Smart Missiles - Quantity',
  'Smart Missiles - Cooldown [s]',
  'Death Wave - Cooldown [s]',
  'Death Wave - Quantity',
  'Death Wave - Damage [x]',
  'Chrono Field - Duration [s]*',
  'Chrono Field - Speed Reduction [%]*',
  'Chrono Field - Cooldown [s]*',
  'Inner Land Mines - Damage [x]',
  'Inner Land Mines - Quantity',
  'Golden Tower - Bonus',
  'Inner Land Mines - Cooldown [s]',
  'Golden Tower - Duration [s]',
  'Golden Tower - Cooldown [s]',
  'Poison Swamp - Damage [x]',
  'Poison Swamp - Duration [s]',
  'Poison Swamp - Cooldown [s]',
  'Black Hole - Cooldown [s]',
  'Black Hole - Duration [s]',
  'Black Hole - Size [m]',
  'Spotlight - Bonus',
  'Spotlight - Angle*',
].map(coreRow)

/** @param {import('../../src/data/workshopSubmoduleCatalog.ts').WorkshopAssistModuleSlot} slot */
export function gameEffectRowsForSlot(slot) {
  if (slot === 'core') return CORE_GAME_EFFECT_ROWS
  return WORKSHOP_SUBMODULE_SECTIONS[slot].rows
}
