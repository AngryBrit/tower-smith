import type { GuardianChipId } from './guardianChips'

/** Empty equipped slot frame in `public/guardians/`. */
export const GUARDIAN_CHIP_SLOT_FRAME = '/guardians/chipSlot.webp'

/** Chip art in `public/guardians/` keyed by chip id. */
export const GUARDIAN_CHIP_IMAGES: Record<GuardianChipId, string> = {
  attack: '/guardians/Attack.webp',
  ally: '/guardians/Ally.webp',
  bounty: '/guardians/Steal.webp',
  fetch: '/guardians/Fetch.webp',
  summon: '/guardians/Summon.webp',
  scout: '/guardians/Scout.webp',
}
