/**
 * Row order for game `ModuleManager.effects` sparse table (330 entries).
 * Cannon/generator follow wiki catalog order; armor/core use in-game row order verified
 * against playerInfo.dat (e.g. Space Displacer land-mine sub-stats, Fudgyrella core indices).
 */
import { WORKSHOP_SUBMODULE_SECTIONS } from '../../src/data/workshopSubmoduleCatalog.ts'

/** @param {string} label */
function slotRow(slot, label) {
  const row = WORKSHOP_SUBMODULE_SECTIONS[slot].rows.find((r) => r.label === label)
  if (!row) throw new Error(`Missing ${slot} submodule row: ${label}`)
  return row
}

/** @param {string} label */
function coreRow(label) {
  return slotRow('core', label)
}

/** @param {string} label */
function armorRow(label) {
  return slotRow('armor', label)
}

/** Core rows in game table order (not wiki catalog order). */
export const CORE_GAME_EFFECT_ROWS = [
  'Chain Lightning - Damage [x]',
  'Chain Lightning - Quantity',
  'Chain Lightning - Chance [%]',
  'Smart Missiles - Damage',
  'Smart Missiles - Quantity',
  'Death Wave - Damage [x]',
  'Death Wave - Quantity',
  'Smart Missiles - Cooldown [s]',
  'Death Wave - Cooldown [s]',
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

/** Armor rows in game table order (Land Mine Chance before Damage; wiki catalog is reversed). */
export const ARMOR_GAME_EFFECT_ROWS = [
  'Health Regen [%]',
  'Defense [%]',
  'Defense Absolute [%]',
  'Thorns Damage',
  'Lifesteal [%]',
  'Knockback Chance [%]',
  'Knockback Force',
  'Orb Speed',
  'Orbs',
  'Shockwave Size',
  'Shockwave Frequency [s]',
  'Land Mine Chance [%]',
  'Land Mine Damage [%]',
  'Land Mine Radius',
  'Death Defy',
  'Wall Health [%]',
  'Wall Rebuild [s]',
].map(armorRow)

/** @param {import('../../src/data/workshopSubmoduleCatalog.ts').WorkshopAssistModuleSlot} slot */
export function gameEffectRowsForSlot(slot) {
  if (slot === 'core') return CORE_GAME_EFFECT_ROWS
  if (slot === 'armor') return ARMOR_GAME_EFFECT_ROWS
  return WORKSHOP_SUBMODULE_SECTIONS[slot].rows
}
