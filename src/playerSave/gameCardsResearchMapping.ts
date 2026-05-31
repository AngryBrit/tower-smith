/**
 * Cards lab ↔ game `researchLevel[id]`.
 * Cards labs use sequential ids 70–78 (UI order).
 */
export const CARDS_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Second Wind Blast': 70,
  'Double Death Ray': 71,
  'Extra Orb Adjuster': 72,
  'Extra Extra Orbs': 73,
  'Energy Shield Extra Hit': 74,
  'Super Tower Bonus': 75,
  'Recharge Second Wind': 76,
  'Recharge Demon Mode': 77,
  'Recharge Nuke': 78,
} as const satisfies Record<string, number>

export type CardsResearchLabName = keyof typeof CARDS_RESEARCH_LEVEL_ID_BY_LAB_NAME
