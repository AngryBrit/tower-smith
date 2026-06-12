import type { StringId } from '../i18n/dictionary'

/** Guardian chip ids (guild guardian loadout). */
export const GUARDIAN_CHIP_IDS = [
  'attack',
  'ally',
  'bounty',
  'fetch',
  'summon',
  'scout',
] as const

export type GuardianChipId = (typeof GUARDIAN_CHIP_IDS)[number]

export type GuardianChipEntry = {
  id: GuardianChipId
  nameId: StringId
}

export const GUARDIAN_CHIPS: readonly GuardianChipEntry[] = GUARDIAN_CHIP_IDS.map((id) => ({
  id,
  nameId: `guardian_chip_${id}` as StringId,
}))

export const GUARDIAN_CHIP_SLOT_COUNT = 4

export const DEFAULT_GUARDIAN_CHIP_SLOTS: readonly (GuardianChipId | null)[] = [
  'fetch',
  null,
  null,
  null,
]
