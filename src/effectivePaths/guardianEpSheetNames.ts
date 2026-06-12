import {
  GUARDIAN_CHIP_ALLY_TRACK_IDS,
  GUARDIAN_CHIP_ATTACK_TRACK_IDS,
  GUARDIAN_CHIP_BOUNTY_TRACK_IDS,
  GUARDIAN_CHIP_FETCH_TRACK_IDS,
  GUARDIAN_CHIP_SCOUT_TRACK_IDS,
  GUARDIAN_CHIP_SUMMON_TRACK_IDS,
} from '../data/guardianChipGodTables'
import { GUARDIAN_CHIP_IDS, type GuardianChipId } from '../data/guardianChips'

/** Guardians v3.0.2 Master Sheet — three level rows (column C) per chip. */
export const GUARDIAN_EP_V302_STATS_PER_CHIP = 3 as const

export const GUARDIAN_EP_V302_LEVEL_FIRST_ROW = 2 as const
export const GUARDIAN_EP_V302_LEVEL_LAST_ROW = 19 as const

/** 0-based column index for chip level dropdowns (column C). */
export const GUARDIAN_EP_V302_LEVEL_COL = 2 as const

/** 0-based column index for unlock label on the third row of each chip (column B). */
export const GUARDIAN_EP_V302_UNLOCK_COL = 1 as const

/** Bits glyph on Guardians v3.0.2 column C dropdown labels. */
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

/** 1-based row for the unlock label (Unlocked / Locked) in column B. */
export function guardianEpUnlockRowIndex(chipId: GuardianChipId): number {
  return GUARDIAN_EP_CHIP_START_ROWS[chipId] + GUARDIAN_EP_V302_STATS_PER_CHIP - 1
}

/** 1-based row for a track dropdown on column C. */
export function guardianEpLevelRowIndex(chipId: GuardianChipId, trackIndex: number): number {
  return GUARDIAN_EP_CHIP_START_ROWS[chipId] + trackIndex
}

export const GUARDIAN_EP_CHIP_IDS = GUARDIAN_CHIP_IDS
