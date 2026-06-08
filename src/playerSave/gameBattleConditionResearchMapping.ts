/**
 * Battle Condition lab ↔ game `researchLevel[id]`.
 */
export const BATTLE_CONDITION_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Battle Condition Reduction': 152,
} as const satisfies Record<string, number>

export type BattleConditionResearchLabName =
  keyof typeof BATTLE_CONDITION_RESEARCH_LEVEL_ID_BY_LAB_NAME
