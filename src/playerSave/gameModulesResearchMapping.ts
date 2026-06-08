/**
 * Modules lab ↔ game `researchLevel[id]`.
 * Ids 139–143 are sequential in the save (AutoplayerProfile max ranges match manifest max levels).
 */
export const MODULES_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Reroll Shards': 139,
  'Daily Mission Shards': 140,
  'Module Shards Cost': 141,
  'Module Coin Cost': 142,
  'Rare Drop Chance': 143,
  'Unmerge Module': 148,
  'Shatter Shards': 199,
  'Cannon Effect Bans': 194,
  'Armor Effect Bans': 195,
  'Generator Effect Bans': 196,
  'Core Effect Bans': 197,
} as const satisfies Record<string, number>

export type ModulesResearchLabName = keyof typeof MODULES_RESEARCH_LEVEL_ID_BY_LAB_NAME
