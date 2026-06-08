/**
 * Card Mastery lab ↔ game `researchLevel[id]`.
 * UI order (Damage → Nuke) uses consecutive ids 160–189.
 */
export const CARD_MASTERY_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Damage Mastery': 160,
  'Attack Speed Mastery': 161,
  'Health Mastery': 162,
  'Health Regen Mastery': 163,
  'Range Mastery': 164,
  'Cash Mastery': 165,
  'Coins Mastery': 166,
  'Slow Aura Mastery': 167,
  'Critical Chance Mastery': 168,
  'Enemy Balance Mastery': 169,
  'Extra Defense Mastery': 170,
  'Fortress Mastery': 171,
  'Free Upgrades Mastery': 172,
  'Extra Orb Mastery': 173,
  'Plasma Cannon Mastery': 174,
  'Critical Coin Mastery': 175,
  'Wave Skip Mastery': 176,
  'Intro Sprint Mastery': 177,
  'Land Mine Stun Mastery': 178,
  'Recovery Package Chance Mastery': 179,
  'Death Ray Mastery': 180,
  'Energy Net Mastery': 181,
  'Super Tower Mastery': 182,
  'Second Wind Mastery': 183,
  'Demon Mode Mastery': 184,
  'Energy Shield Mastery': 185,
  'Wave Accelerator Mastery': 186,
  'Berserker Mastery': 187,
  'Ultimate Crit Mastery': 188,
  'Nuke Mastery': 189,
} as const satisfies Record<string, number>

export type CardMasteryResearchLabName =
  keyof typeof CARD_MASTERY_RESEARCH_LEVEL_ID_BY_LAB_NAME
