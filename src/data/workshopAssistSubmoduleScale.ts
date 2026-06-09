/**

 * Assist chassis sub-module effects scale by sub stone efficiency + Assist Module Substats labs,

 * then floor to the nearest whole integer (wiki assist modules).

 */



import type { WorkshopPersistedV1 } from '../labPresetsStorage'

import type { ResearchData } from '../types/research'

import { assistFlooredQuantity } from './workshopAssistModuleCatalog'
import { submoduleEffectId } from './workshopSubmoduleCatalog'

import {
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



/** Sub stone % + Assist Module Substats lab % for this slot. */

export function assistSubmoduleSubEfficiencyPercent(

  ws: WorkshopPersistedV1,

  slot: WorkshopAssistModuleSlot,

  research: ResearchData | null,

  labOverrides: Record<string, number>,

): number {

  const stone = assistSubStoneEfficiencyFromPersisted(ws, slot)

  const lab =

    research != null

      ? workshopAssistModuleLabPercentPoints(research, labOverrides, slot).substatsPercent

      : 0

  return stone + lab

}



export function assistSubmoduleEffectsActive(

  ws: WorkshopPersistedV1,

  slot: WorkshopAssistModuleSlot,

): boolean {

  const assist = workshopAssistChassisModuleSelection(ws, slot)

  return assist.unlocked && assist.moduleId != null && assist.moduleId !== ''

}



/** Apply assist stone + lab scaling to a raw catalog cell value (floored). */

/** Fractional submodule values (e.g. attack speed) scale proportionally; integer stats floor. */
const ASSIST_PROPORTIONAL_SUBMODULE_EFFECT_IDS = new Set([
  submoduleEffectId('Attack Speed'),
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


