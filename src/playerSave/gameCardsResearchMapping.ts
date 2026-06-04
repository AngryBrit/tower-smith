/**
 * Cards lab ↔ game `researchLevel[id]`.
 * Recharge cards use ids 145–146 and 149 (Recharge Nuke; id 147 is ultimate Recharge Missile Barrage).
 */
export const CARDS_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Second Wind Blast': 70,
  'Double Death Ray': 71,
  'Extra Orb Adjuster': 72,
  'Extra Extra Orbs': 73,
  'Energy Shield Extra Hit': 74,
  'Super Tower Bonus': 75,
  'Recharge Second Wind': 145,
  'Recharge Demon Mode': 146,
  'Recharge Nuke': 149,
} as const satisfies Record<string, number>

export type CardsResearchLabName = keyof typeof CARDS_RESEARCH_LEVEL_ID_BY_LAB_NAME
