import type { GuardianChipId } from '../data/guardianChips'
import { GUARDIAN_CHIP_IDS } from '../data/guardianChips'
import type { GuardianChipState } from '../guardianChipStorage'

export type GuardiansEpSyncState = {
  upgrades: GuardianChipState['upgrades']
  unlockedChipIds: GuardianChipId[]
}

/** Guardian chip upgrade levels and unlock flags from TowerSmith state. */
export function guardiansEpStateFromPersisted(state: GuardianChipState): GuardiansEpSyncState {
  return {
    upgrades: {
      attack: { ...state.upgrades.attack },
      ally: { ...state.upgrades.ally },
      bounty: { ...state.upgrades.bounty },
      fetch: { ...state.upgrades.fetch },
      summon: { ...state.upgrades.summon },
      scout: { ...state.upgrades.scout },
    },
    unlockedChipIds: GUARDIAN_CHIP_IDS.filter((id) => state.unlockedChipIds.includes(id)),
  }
}
