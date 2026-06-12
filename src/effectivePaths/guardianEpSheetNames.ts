import {
  GUARDIAN_CHIP_ALLY_TRACK_IDS,
  GUARDIAN_CHIP_ATTACK_TRACK_IDS,
  GUARDIAN_CHIP_BOUNTY_TRACK_IDS,
  GUARDIAN_CHIP_FETCH_TRACK_IDS,
  GUARDIAN_CHIP_SCOUT_TRACK_IDS,
  GUARDIAN_CHIP_SUMMON_TRACK_IDS,
} from '../data/guardianChipGodTables'
import { GUARDIAN_CHIP_IDS, type GuardianChipId } from '../data/guardianChips'

/** Guardians v3.0.2 Master Sheet — three level rows per chip (rows 2–19). */
export const GUARDIAN_EP_V302_STATS_PER_CHIP = 3 as const

export const GUARDIAN_EP_V302_LEVEL_FIRST_ROW = 2 as const
export const GUARDIAN_EP_V302_LEVEL_LAST_ROW = 19 as const

/** 0-based column index for chip level dropdowns (column F). */
export const GUARDIAN_EP_V302_LEVEL_COL = 5 as const

/** 0-based column index for unlock checkboxes (column B). */
export const GUARDIAN_EP_V302_UNLOCK_COL = 1 as const

/** Chips that are always unlocked on the sheet (no B-column checkbox). */
export const GUARDIAN_EP_ALWAYS_UNLOCKED_CHIP_IDS = ['attack', 'ally'] as const satisfies readonly GuardianChipId[]

/** 1-based rows for unlock checkboxes on column B (TRUE/FALSE). */
export const GUARDIAN_EP_V302_UNLOCKED_ROWS = {
  bounty: 10,
  fetch: 13,
  summon: 16,
  scout: 19,
} as const satisfies Record<Exclude<GuardianChipId, 'attack' | 'ally'>, number>

export type GuardianEpUnlockableChipId = keyof typeof GUARDIAN_EP_V302_UNLOCKED_ROWS

export const GUARDIAN_EP_V302_UNLOCKED_CHIP_IDS = Object.keys(
  GUARDIAN_EP_V302_UNLOCKED_ROWS,
) as GuardianEpUnlockableChipId[]

/** Bits glyph on Guardians v3.0.2 column F dropdown labels. */
export const GUARDIAN_EP_BITS_SYMBOL = '⧈'

/** First Google Sheet row (1-based) for each chip block. */
export const GUARDIAN_EP_CHIP_START_ROWS: Record<GuardianChipId, number> = {
  attack: 2,
  ally: 5,
  bounty: 8,
  fetch: 11,
  summon: 14,
  scout: 17,
}

/** Upgrade track ids in Master Sheet row order within each chip block. */
export const GUARDIAN_EP_CHIP_TRACK_ORDER: Record<GuardianChipId, readonly string[]> = {
  attack: GUARDIAN_CHIP_ATTACK_TRACK_IDS,
  ally: GUARDIAN_CHIP_ALLY_TRACK_IDS,
  bounty: GUARDIAN_CHIP_BOUNTY_TRACK_IDS,
  fetch: GUARDIAN_CHIP_FETCH_TRACK_IDS,
  summon: GUARDIAN_CHIP_SUMMON_TRACK_IDS,
  scout: GUARDIAN_CHIP_SCOUT_TRACK_IDS,
}

/** 1-based row for a track dropdown on column F. */
export function guardianEpLevelRowIndex(chipId: GuardianChipId, trackIndex: number): number {
  return GUARDIAN_EP_CHIP_START_ROWS[chipId] + trackIndex
}

export const GUARDIAN_EP_CHIP_IDS = GUARDIAN_CHIP_IDS
