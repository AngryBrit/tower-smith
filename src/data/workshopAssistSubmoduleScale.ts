/**

 * Assist chassis sub-module effects scale by sub stone efficiency + Assist Module Substats labs,

 * then floor to the nearest whole integer (wiki assist modules).

 */



import type { WorkshopPersistedV1 } from '../labPresetsStorage'

import type { ResearchData } from '../types/research'

import { assistFlooredQuantity } from './workshopAssistModuleCatalog'
import {
  assistSubmodulePickerCellFromScaledNumber,
  parseSubmoduleCellNumber,
  submoduleEffectId,
  submoduleEffectPickerSlotText,
} from './workshopSubmoduleCatalog'

import {
  assistStoneEfficiencyPercentFromLevel,
  assistSubStoneEfficiencyFromPersisted,
  clampAssistSubmoduleEfficiencyPercent,
  workshopAssistChassisModuleSelection,
} from './workshopAssistChassisModule'

import { workshopAssistModuleLabPercentPoints } from './workshopSimModules'

import type { WorkshopAssistModuleSlot } from './workshopSimModules'



export type WorkshopSubmoduleBonusContext = {

  ws: WorkshopPersistedV1

  research: ResearchData | null

  labOverrides: Record<string, number>

}



/** Sub stone % + Assist Module Substats lab % for this slot (wiki combined cap 100%). */
export function assistSubmoduleSubEfficiencyPercent(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  research: ResearchData | null,
  labOverrides: Record<string, number>,
): number {
  const stone = assistStoneEfficiencyPercentFromLevel(
    assistSubStoneEfficiencyFromPersisted(ws, slot),
  )
  const lab =
    research != null
      ? workshopAssistModuleLabPercentPoints(research, labOverrides, slot).substatsPercent
      : 0
  return stone + lab
}

/** In-game assist module picker scales by sub stone % + Assist Module Substats lab only. */
export function assistSubmodulePickerDisplayEfficiencyPercent(
  ws: WorkshopPersistedV1,
  slot: WorkshopAssistModuleSlot,
  research: ResearchData | null,
  labOverrides: Record<string, number>,
): number {
  return assistSubmoduleSubEfficiencyPercent(ws, slot, research, labOverrides)
}



export function assistSubmoduleEffectsActive(

  ws: WorkshopPersistedV1,

  slot: WorkshopAssistModuleSlot,

): boolean {

  const assist = workshopAssistChassisModuleSelection(ws, slot)

  return assist.unlocked && assist.moduleId != null && assist.moduleId !== ''

}



/** Fractional submodule values scale proportionally in sim; integer quantity stats floor. */
const ASSIST_PROPORTIONAL_SUBMODULE_EFFECT_IDS = new Set([
  submoduleEffectId('Attack Speed'),
  submoduleEffectId('Max Recovery'),
])

export function scaleAssistSubmoduleRawValue(
  rawValue: number,
  effectId: string,
  efficiencyPercent: number,
): number {
  if (rawValue === 0 || efficiencyPercent <= 0) return 0
  const eff = clampAssistSubmoduleEfficiencyPercent(efficiencyPercent)
  if (ASSIST_PROPORTIONAL_SUBMODULE_EFFECT_IDS.has(effectId)) {
    return (rawValue * eff) / 100
  }
  return assistFlooredQuantity(rawValue, eff)
}

/** Proportional scaled value for assist picker display (may show decimals; sim still floors). */
export function assistSubmoduleDisplayScaledValue(
  rawValue: number,
  efficiencyPercent: number,
): number {
  if (rawValue === 0 || efficiencyPercent <= 0) return 0
  const eff = clampAssistSubmoduleEfficiencyPercent(efficiencyPercent)
  return (rawValue * eff) / 100
}



export function scaleAssistSubmoduleValueForSlot(

  ws: WorkshopPersistedV1,

  slot: WorkshopAssistModuleSlot,

  rawValue: number,

  effectId: string,

  research: ResearchData | null,

  labOverrides: Record<string, number>,

): number {

  if (rawValue === 0 || !assistSubmoduleEffectsActive(ws, slot)) return 0

  const eff = assistSubmoduleSubEfficiencyPercent(ws, slot, research, labOverrides)

  return scaleAssistSubmoduleRawValue(rawValue, effectId, eff)

}

/** In-game assist module picker line with sub-stone + lab scaling applied. */
export function assistSubmodulePickerSlotText(
  cell: string,
  effectLabel: string,
  _effectId: string,
  ctx: WorkshopSubmoduleBonusContext,
  slot: WorkshopAssistModuleSlot,
): string {
  const raw = parseSubmoduleCellNumber(cell) ?? 0
  const eff = assistSubmodulePickerDisplayEfficiencyPercent(
    ctx.ws,
    slot,
    ctx.research,
    ctx.labOverrides,
  )
  const scaled = assistSubmoduleEffectsActive(ctx.ws, slot)
    ? assistSubmoduleDisplayScaledValue(raw, eff)
    : 0
  return submoduleEffectPickerSlotText(
    assistSubmodulePickerCellFromScaledNumber(scaled, cell, effectLabel),
    effectLabel,
  )
}


