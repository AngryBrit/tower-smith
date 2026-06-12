/**
 * Sub-Module Effects tables (wiki) per chassis slot.
 */

import {
  workshopChassisModuleMaxLevel,
  type WorkshopChassisModuleMergeTier,
} from './workshopChassisModuleShared'
import type { WorkshopAssistModuleSlot } from './workshopSimModules'
import type { WorkshopSubmoduleRarity } from './workshopSubmoduleEffects'

export type SubmoduleEffectCells = Record<WorkshopSubmoduleRarity, string | null>

export type WorkshopSubmoduleEffectRow = {
  label: string
  cells: SubmoduleEffectCells
}

export type WorkshopSubmoduleSection = {
  slot: WorkshopAssistModuleSlot
  title: string
  rows: readonly WorkshopSubmoduleEffectRow[]
  footnotes?: readonly string[]
}

export function submoduleCells(
  common: string | null,
  rare: string | null,
  epic: string | null,
  legendary: string | null,
  mythic: string | null,
  ancestral: string | null,
): SubmoduleEffectCells {
  return { common, rare, epic, legendary, mythic, ancestral }
}

function row(label: string, cells: SubmoduleEffectCells): WorkshopSubmoduleEffectRow {
  return { label, cells }
}

/** Stable id for persistence / selection (`Attack Speed` → `attack-speed`). */
export function submoduleEffectId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Wiki label without trailing unit tag (`Defense [%]` → `Defense`, `Spotlight - Angle*` → `Spotlight - Angle`). */
export function submoduleEffectDisplayName(label: string): string {
  return label
    .replace(/\s*\[[^\]]*\]\s*\*?\s*$/i, '')
    .replace(/\*+\s*$/, '')
    .trim()
}

const SUBMODULE_LABEL_UNIT_SUFFIX = /\[\s*([^\]]+)\s*\]\s*\*?\s*$/i

function submoduleLabelUnit(label: string | undefined): string | null {
  if (label == null) return null
  const match = label.match(SUBMODULE_LABEL_UNIT_SUFFIX)
  if (match != null) return match[1]!.trim().toLowerCase()
  if (submoduleEffectDisplayName(label) === 'Spotlight - Angle') return '°'
  return null
}

/** Picker / in-game slot line (`5` + `Defense [%]` → `+5%`). */
export function formatSubmoduleCellDisplay(cell: string, effectLabel?: string): string {
  const trimmed = cell.trim()
  if (trimmed === '') return trimmed

  const unit = submoduleLabelUnit(effectLabel)
  const hasLeadingSign = /^[+-]/.test(trimmed)
  let display = hasLeadingSign ? trimmed : `+${trimmed}`

  if (unit != null) {
    const unitPattern =
      unit === '%'
        ? /%$/
        : unit === '°'
          ? /°$/
          : unit === 'm'
            ? /m$/i
            : unit === 's'
              ? /s$/i
              : unit === 'x'
                ? /x$/i
                : null

    if (unitPattern != null && !unitPattern.test(display)) {
      display = `${display}${unit}`
    }
  }

  if (
    effectLabel != null &&
    isSubmoduleMultiplierEffectLabel(effectLabel) &&
    !/x$/i.test(display)
  ) {
    display = `${display}x`
  }

  return display
}

/** Wiki [%] rows that use in-game `+n% Stat %` (trailing % on the stat name). */
const SUBMODULE_PICKER_PERCENT_TRAILING_NAME = new Set(['Defense'])

/** Submodule rows whose wiki cells are additive × multipliers (`0.4` → `+0.4x`). */
const SUBMODULE_MULTIPLIER_EFFECT_LABELS = new Set(['Max Recovery'])

export function isSubmoduleMultiplierEffectLabel(label: string): boolean {
  return SUBMODULE_MULTIPLIER_EFFECT_LABELS.has(submoduleEffectDisplayName(label))
}

/** In-game module picker slot (`Defense [%]` + `5` → `+5% Defense %`). */
export function submoduleEffectPickerSlotText(cell: string, effectLabel: string): string {
  const value = formatSubmoduleCellDisplay(cell, effectLabel)
  if (submoduleLabelUnit(effectLabel) !== '%') {
    const name = submoduleEffectDisplayName(effectLabel)
    return name === '' ? value : `${value} ${name}`
  }
  const name = submoduleEffectDisplayName(effectLabel)
  if (SUBMODULE_PICKER_PERCENT_TRAILING_NAME.has(name)) {
    return `${value} ${name} %`
  }
  return `${value} ${name}`
}

/**
 * In-game sub-module effect slot unlock levels (wiki Modules → Main Effect).
 * Two slots at Lv.1; then one each at 41, 101, 141, 161, 201, and 241.
 */
export const WORKSHOP_SUBMODULE_SLOT_UNLOCK_LEVEL: readonly number[] = [
  1,
  1,
  41,
  101,
  141,
  161,
  201,
  241,
]

export const WORKSHOP_SUBMODULE_SLOT_COUNT = WORKSHOP_SUBMODULE_SLOT_UNLOCK_LEVEL.length

/** Highest sub-module slot unlock (wiki). */
export const WORKSHOP_SUBMODULE_MAX_UNLOCK_LEVEL =
  WORKSHOP_SUBMODULE_SLOT_UNLOCK_LEVEL[WORKSHOP_SUBMODULE_SLOT_COUNT - 1]!

/** Module level required to unlock sub-module effect slot `slotIndex` (0-based). */
export function workshopSubmoduleSlotUnlockLevel(slotIndex: number): number {
  return WORKSHOP_SUBMODULE_SLOT_UNLOCK_LEVEL[slotIndex] ?? 1
}

/** Whether a sub-module slot is active at `moduleLevel` (also blocked above rarity max level). */
export function workshopSubmoduleSlotUnlocked(
  slotIndex: number,
  moduleLevel: number,
  moduleRarity?: WorkshopChassisModuleMergeTier,
): boolean {
  const unlockAt = workshopSubmoduleSlotUnlockLevel(slotIndex)
  if (moduleRarity != null && unlockAt > workshopChassisModuleMaxLevel(moduleRarity)) {
    return false
  }
  const level = Number.isFinite(moduleLevel) ? Math.max(0, Math.trunc(moduleLevel)) : 0
  return level >= unlockAt
}

/** Ancestral 5★ module max level (wiki module upgrade table). */
export const WORKSHOP_MODULE_LEVEL_MAX = 300

/** Parse numeric sub-module cell (strips %, s, m, x suffixes). */
export function parseSubmoduleCellNumber(cell: string | null): number | null {
  if (cell == null) return null
  const n = Number(cell.replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : null
}

function trimTrailingDisplayZeros(value: string): string {
  if (!value.includes('.')) return value
  return value.replace(/\.?0+$/, '')
}

const SUBMODULE_RARITY_ORDER: (keyof SubmoduleEffectCells)[] = [
  'common',
  'rare',
  'epic',
  'legendary',
  'mythic',
  'ancestral',
]

/** Largest wiki cell magnitude for a submodule row (used for assist picker display rules). */
export function submoduleRowPeakValue(effectLabel: string): number {
  let peak = 0
  for (const section of Object.values(WORKSHOP_SUBMODULE_SECTIONS)) {
    const row = section.rows.find((r) => r.label === effectLabel)
    if (row == null) continue
    for (const rarity of SUBMODULE_RARITY_ORDER) {
      const n = parseSubmoduleCellNumber(row.cells[rarity])
      if (n != null) peak = Math.max(peak, Math.abs(n))
    }
    return peak
  }
  return peak
}

function assistPickerTrunc2(value: number): number {
  return Math.floor(Math.abs(value) * 100 + 1e-9) / 100
}

function assistPickerRound2(value: number): number {
  return Math.round(Math.abs(value) * 100) / 100
}

function assistPickerRound1(value: number): number {
  return Math.round(Math.abs(value) * 10) / 10
}

/** In-game assist picker rounds negative cooldown seconds up in magnitude (-1.52 → -1.6s). */
function assistPickerFormatSeconds(scaled: number): string {
  const sign = scaled < 0 ? '-' : ''
  const abs = Math.abs(scaled)
  const rounded =
    scaled < 0 ? Math.ceil(abs * 10 - 1e-9) / 10 : assistPickerRound1(abs)
  return `${sign}${trimTrailingDisplayZeros(rounded.toFixed(1))}s`
}

function assistPickerFormatDegrees(scaled: number): string {
  const sign = scaled < 0 ? '-' : ''
  return `${sign}${Math.round(Math.abs(scaled))}°`
}

function assistPickerFormatPlainOneDecimal(scaled: number): string {
  const sign = scaled < 0 ? '-' : ''
  return `${sign}${trimTrailingDisplayZeros(assistPickerRound1(Math.abs(scaled)).toFixed(1))}`
}

function submoduleScaledValueSuffix(templateSuffix: string, effectLabel?: string): string {
  if (templateSuffix !== '') return templateSuffix
  const unit = submoduleLabelUnit(effectLabel)
  return unit === '°' ? '°' : ''
}

/** In-game assist module picker value formatting (differs from main-module catalog cells). */
export function assistSubmodulePickerCellFromScaledNumber(
  scaled: number,
  templateCell: string,
  effectLabel?: string,
): string {
  if (effectLabel != null && isSubmoduleMultiplierEffectLabel(effectLabel)) {
    if (scaled === 0) return '0x'
    return `${scaled < 0 ? '-' : ''}${Number(Math.abs(scaled).toFixed(2))}x`
  }

  const trimmed = templateCell.trim()
  const templateSuffix = trimmed.replace(/^[+-]?[0-9.]+/, '')
  const suffix = submoduleScaledValueSuffix(templateSuffix, effectLabel)
  const isPercent = templateSuffix === '%' || submoduleLabelUnit(effectLabel) === '%'

  if (scaled === 0) return isPercent ? '0%' : `0${suffix}`

  const sign = scaled < 0 ? '-' : ''
  const abs = Math.abs(scaled)

  if (isPercent) {
    const peak = effectLabel != null ? submoduleRowPeakValue(effectLabel) : 0
    if (peak >= 20) {
      const whole = Math.floor(abs + 1e-9)
      const frac = abs - whole
      if (frac < 0.5 - 1e-9) {
        return `${sign}${whole}%`
      }
      return `${sign}${trimTrailingDisplayZeros(assistPickerRound1(abs).toFixed(1))}%`
    }
    const truncated = assistPickerTrunc2(abs)
    return `${sign}${trimTrailingDisplayZeros(truncated.toFixed(2))}%`
  }

  const labelUnit = submoduleLabelUnit(effectLabel)
  if (labelUnit === 's') {
    return assistPickerFormatSeconds(scaled)
  }
  if (labelUnit === '°') {
    return assistPickerFormatDegrees(scaled)
  }

  const templateNum = trimmed.replace(/[^0-9.-]/g, '')
  const rounded = assistPickerRound2(abs)
  if (suffix !== '') {
    return `${sign}${trimTrailingDisplayZeros(rounded.toFixed(2))}${suffix}`
  }

  if (templateNum.includes('.')) {
    return `${sign}${trimTrailingDisplayZeros(rounded.toFixed(2))}`
  }

  return assistPickerFormatPlainOneDecimal(scaled)
}

/** Rebuild a wiki cell for assist picker display (`11` at 20% eff → `2.2%`). */
export function submoduleCellFromScaledNumber(
  scaled: number,
  templateCell: string,
  effectLabel?: string,
): string {
  const trimmed = templateCell.trim()
  const templateSuffix = trimmed.replace(/^[+-]?[0-9.]+/, '')
  const suffix = submoduleScaledValueSuffix(templateSuffix, effectLabel)
  const templateNum = trimmed.replace(/[^0-9.-]/g, '')
  const labelUnit = submoduleLabelUnit(effectLabel)
  const isPercent = templateSuffix === '%' || labelUnit === '%'

  if (effectLabel != null && isSubmoduleMultiplierEffectLabel(effectLabel)) {
    if (scaled === 0) return '0x'
    return `${scaled < 0 ? '-' : ''}${Number(Math.abs(scaled).toFixed(2))}x`
  }

  if (scaled === 0) return isPercent ? '0%' : `0${suffix}`

  const sign = scaled < 0 ? '-' : ''
  const abs = Math.abs(scaled)

  if (isPercent) {
    return `${sign}${trimTrailingDisplayZeros(abs.toFixed(1))}%`
  }

  if (templateNum.includes('.') || suffix !== '') {
    const decimals = suffix === 's' || suffix === 'm' ? 2 : 1
    return `${sign}${trimTrailingDisplayZeros(abs.toFixed(decimals))}${suffix}`
  }

  if (Math.abs(abs - Math.round(abs)) < 1e-9) {
    return `${sign}${Math.trunc(abs)}${suffix}`
  }

  return `${sign}${trimTrailingDisplayZeros(abs.toFixed(1))}${suffix}`
}

export const WORKSHOP_SUBMODULE_GLOBAL_INTRO: readonly string[] = [
  'Sub-Module Effects are available on all Modules. Sub-module rarity is independent of module rarity (e.g. an Epic module can have Rare and Common sub-modules). Sub-modules can be rerolled with reroll shards; locking a slot prevents reroll on that slot but increases cost.',
]

export const WORKSHOP_SUBMODULE_GLOBAL_NOTES: readonly string[] = [
  'Additional stats from Assist Module sub-module effects do not bypass hard caps (e.g. 98% defense, 90% Chrono Field slow, 150s Wall rebuild, 7s Shockwave Frequency, 40% Death Defy, 37s Inner Land Mine CD).',
]

const CANNON_SUBMODULE_ROWS: readonly WorkshopSubmoduleEffectRow[] = [
  row('Attack Speed', submoduleCells('0.3', '0.5', '0.7', '1', '3', '5')),
  row('Crit Chance [%]', submoduleCells('2', '3', '4', '6', '8', '10')),
  row('Crit Factor', submoduleCells('2', '4', '6', '8', '12', '15')),
  row('Attack Range [m]', submoduleCells('2', '4', '8', '12', '20', '30')),
  row('Damage / Meter [m]', submoduleCells('0.005', '0.01', '0.025', '0.04', '0.075', '0.15')),
  row('Multishot Chance [%]', submoduleCells(null, '3', '5', '7', '10', '13')),
  row('Multishot Targets', submoduleCells(null, null, '1', '2', '3', '4')),
  row('Rapid Fire Chance [%]', submoduleCells(null, '2', '4', '6', '9', '12')),
  row('Rapid Fire Duration', submoduleCells(null, '0.4s', '0.8s', '1.4s', '2.5s', '3.5s')),
  row('Bounce Shot Chance', submoduleCells(null, '2%', '3%', '5%', '9%', '12%')),
  row('Bounce Shot Targets', submoduleCells(null, null, '1', '2', '3', '4')),
  row('Bounce Shot Range', submoduleCells(null, '0.5m', '0.8m', '1.2m', '1.8m', '2.0m')),
  row('Super Crit Chance', submoduleCells(null, null, '3%', '5%', '7%', '10%')),
  row('Super Crit Multi', submoduleCells(null, null, '2', '3', '5', '7')),
  row('Rend Armor Chance', submoduleCells(null, null, null, '2%', '5%', '8%')),
  row('Rend Armor Multi', submoduleCells(null, null, null, '2%', '5%', '8%')),
  row('Max Rend Armor Multi', submoduleCells(null, null, null, '200%', '300%', '500%')),
]

const ARMOR_SUBMODULE_ROWS: readonly WorkshopSubmoduleEffectRow[] = [
  row('Health Regen [%]', submoduleCells('20', '40', '60', '100', '200', '400')),
  row('Defense [%]', submoduleCells('1', '2', '3', '5', '6', '8')),
  row('Defense Absolute [%]', submoduleCells('15', '25', '40', '100', '500', '1000')),
  row('Thorns Damage', submoduleCells(null, null, '2', '4', '7', '10')),
  row('Lifesteal [%]', submoduleCells(null, null, '0.3', '0.5', '1.5', '2.0')),
  row('Knockback Chance [%]', submoduleCells(null, null, '2', '4', '6', '9')),
  row('Knockback Force', submoduleCells(null, null, '0.1', '0.4', '0.9', '1.5')),
  row('Orb Speed', submoduleCells(null, null, '1', '1.5', '2', '3')),
  row('Orbs', submoduleCells(null, null, null, null, '1', '2')),
  row('Shockwave Size', submoduleCells(null, null, '0.1', '0.3', '0.7', '1')),
  row('Shockwave Frequency [s]', submoduleCells(null, null, '-1', '-2', '-3', '-4')),
  row('Land Mine Damage [%]', submoduleCells(null, '30', '50', '150', '500', '800')),
  row('Land Mine Chance [%]', submoduleCells(null, '1.5', '3', '6', '9', '12')),
  row('Land Mine Radius', submoduleCells(null, '0.1', '0.15', '0.3', '0.75', '1')),
  row('Death Defy', submoduleCells(null, null, null, '1.5%', '3.5%', '5%')),
  row('Wall Health [%]', submoduleCells(null, null, '20', '40', '90', '120')),
  row('Wall Rebuild [s]', submoduleCells(null, null, '-20', '-40', '-80', '-100')),
]

const GENERATOR_SUBMODULE_ROWS: readonly WorkshopSubmoduleEffectRow[] = [
  row('Cash Bonus', submoduleCells('0.1', '0.2', '0.3', '0.5', '1.2', '2.5')),
  row('Cash / Wave', submoduleCells('30', '50', '100', '200', '500', '1000')),
  row('Coins / Kill Bonus', submoduleCells('0.1', '0.2', '0.3', '0.4', '0.5', '0.6')),
  row('Coins / Wave', submoduleCells('20', '35', '60', '120', '200', '350')),
  row('Free Attack Upgrade [%]', submoduleCells('2', '4', '6', '8', '10', '12')),
  row('Free Defense Upgrade [%]', submoduleCells('2', '4', '6', '8', '10', '12')),
  row('Free Utility Upgrade [%]', submoduleCells('2', '4', '6', '8', '10', '12')),
  row('Interest / Wave [%]', submoduleCells(null, null, '2', '4', '6', '8')),
  row('Recovery Amount [%]', submoduleCells(null, null, '3', '5', '7', '10')),
  row('Max Recovery', submoduleCells(null, null, '0.4', '0.7', '1.0', '1.5')),
  row('Package Chance [%]', submoduleCells(null, null, '5', '8', '11', '15')),
  row('Enemy Attack Level Skip [%]', submoduleCells(null, null, '2', '4', '6', '8')),
  row('Enemy Health Level Skip [%]', submoduleCells(null, null, '2', '4', '6', '8')),
]

const CORE_SUBMODULE_ROWS: readonly WorkshopSubmoduleEffectRow[] = [
  row('Golden Tower - Bonus', submoduleCells(null, null, '1', '2', '3', '4')),
  row('Golden Tower - Duration [s]', submoduleCells(null, null, null, '2', '4', '7')),
  row('Golden Tower - Cooldown [s]', submoduleCells(null, null, null, '-5', '-8', '-12')),
  row('Black Hole - Size [m]', submoduleCells('2', '4', '6', '8', '10', '12')),
  row('Black Hole - Duration [s]', submoduleCells(null, null, null, '2', '3', '4')),
  row('Black Hole - Cooldown [s]', submoduleCells(null, null, null, '-2', '-3', '-4')),
  row('Spotlight - Bonus', submoduleCells('1.2', '2.5', '3.5', '10', '15', '20')),
  row('Spotlight - Angle*', submoduleCells(null, null, '3', '6', '11', '15')),
  row('Chrono Field - Duration [s]*', submoduleCells(null, null, null, '4', '7', '10')),
  row('Chrono Field - Speed Reduction [%]*', submoduleCells(null, null, '3', '8', '11', '15')),
  row('Chrono Field - Cooldown [s]*', submoduleCells(null, null, null, '-4', '-7', '-10')),
  row('Death Wave - Damage [x]', submoduleCells('8', '15', '25', '50', '100', '250')),
  row('Death Wave - Quantity', submoduleCells(null, null, null, '1', '2', '3')),
  row('Death Wave - Cooldown [s]', submoduleCells(null, null, null, '-6', '-10', '-13')),
  row('Smart Missiles - Damage', submoduleCells('8', '15', '25', '50', '100', '250')),
  row('Smart Missiles - Quantity', submoduleCells(null, null, '1', '2', '4', '5')),
  row('Smart Missiles - Cooldown [s]', submoduleCells(null, null, null, '-2', '-4', '-6')),
  row('Inner Land Mines - Damage [x]', submoduleCells('8', '15', '25', '50', '100', '250')),
  row('Inner Land Mines - Quantity', submoduleCells(null, null, null, '1', '2', '3')),
  row('Inner Land Mines - Cooldown [s]', submoduleCells(null, null, '-5', '-8', '-10', '-13')),
  row('Poison Swamp - Damage [x]', submoduleCells('8', '15', '25', '50', '100', '250')),
  row('Poison Swamp - Duration [s]', submoduleCells(null, null, null, '2', '5', '10')),
  row('Poison Swamp - Cooldown [s]', submoduleCells(null, '-2', '-4', '-6', '-8', '-10')),
  row('Chain Lightning - Damage [x]', submoduleCells('8', '15', '25', '50', '100', '250')),
  row('Chain Lightning - Quantity', submoduleCells(null, null, '1', '2', '3', '4')),
  row('Chain Lightning - Chance [%]', submoduleCells('2', '4', '6', '9', '12', '15')),
]

export const WORKSHOP_SUBMODULE_SECTIONS: Record<
  WorkshopAssistModuleSlot,
  WorkshopSubmoduleSection
> = {
  cannon: {
    slot: 'cannon',
    title: 'Cannon Submodules (Attack)',
    rows: CANNON_SUBMODULE_ROWS,
  },
  armor: {
    slot: 'armor',
    title: 'Armor Submodules (Defense)',
    rows: ARMOR_SUBMODULE_ROWS,
  },
  generator: {
    slot: 'generator',
    title: 'Generator Submodules (Utility)',
    rows: GENERATOR_SUBMODULE_ROWS,
  },
  core: {
    slot: 'core',
    title: 'Cores Sub Modules (Ultimate Weapons)',
    rows: CORE_SUBMODULE_ROWS,
    footnotes: [
      'When Spotlight angle is 90° or Chrono Field duration/cooldown is maxed with Workshop stats and/or lab, the respective sub effects (*) will be banned from rolls for free.',
    ],
  },
}

/** Attack Speed row — used by workshop displayed-attack-speed sim. */
export function cannonSubmoduleAttackSpeedByRarity(): Record<
  WorkshopSubmoduleRarity,
  number
> {
  const cells = CANNON_SUBMODULE_ROWS[0]!.cells
  const out = {} as Record<WorkshopSubmoduleRarity, number>
  for (const r of ['common', 'rare', 'epic', 'legendary', 'mythic', 'ancestral'] as const) {
    out[r] = parseSubmoduleCellNumber(cells[r]) ?? 0
  }
  return out
}
