import type { StringId } from '../i18n/dictionary'
import type { WorkshopUltimatePlusAbilityId } from '../data/workshopUltimatePlus'

export const WORKSHOP_ULTIMATE_PLUS_TITLE: Record<WorkshopUltimatePlusAbilityId, StringId> = {
  chainLightningSmite: 'ws_uwp_chainLightningSmite',
  smartMissilesCoverFire: 'ws_uwp_smartMissilesCoverFire',
  poisonSwampDeathCreep: 'ws_uwp_poisonSwampDeathCreep',
  goldenTowerGoldenCombo: 'ws_uwp_goldenTowerGoldenCombo',
  innerLandMinesChargedMines: 'ws_uwp_innerLandMinesChargedMines',
  deathWaveKillWall: 'ws_uwp_deathWaveKillWall',
  blackHoleConsume: 'ws_uwp_blackHoleConsume',
  chronoFieldChronoLoop: 'ws_uwp_chronoFieldChronoLoop',
  spotlightLightRange: 'ws_uwp_spotlightLightRange',
}

export function plusAbilityBarTitle(fullTitle: string): string {
  const sep = fullTitle.includes(' — ') ? ' — ' : ' - '
  const idx = fullTitle.lastIndexOf(sep)
  return idx >= 0 ? fullTitle.slice(idx + sep.length) : fullTitle
}
