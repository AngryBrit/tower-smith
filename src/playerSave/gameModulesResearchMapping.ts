/**
 * Modules lab ↔ game `researchLevel[id]`.
 * Common Drop Chance uses id 134; ids 139–143 are sequential in the save.
 */
export const MODULES_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Common Drop Chance': 134,
  'Reroll Shards': 139,
  'Daily Mission Shards': 140,
  'Module Shards Cost': 141,
  'Module Coin Cost': 142,
  'Rare Drop Chance': 143,
  'Unmerge Module': 151,
  'Shatter Shards': 152,
  'Cannon Effect Bans': 194,
  'Armor Effect Bans': 195,
  'Generator Effect Bans': 196,
  'Core Effect Bans': 197,
  'Assist Module Substats - Cannon': 230,
  'Assist Module Substats - Armor': 231,
  'Assist Module Substats - Generator': 232,
  'Assist Module Substats - Core': 233,
  'Assist Module Bonus - Cannon': 234,
  'Assist Module Bonus - Armor': 235,
  'Assist Module Bonus - Generator': 236,
  'Assist Module Bonus - Core': 237,
} as const satisfies Record<string, number>

export type ModulesResearchLabName = keyof typeof MODULES_RESEARCH_LEVEL_ID_BY_LAB_NAME
