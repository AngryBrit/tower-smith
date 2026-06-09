/**
 * Ultimate weapon lab ↔ game `researchLevel[id]`.
 * First ten ult labs (missile / chrono / swamp): ids 50–59 (UI order).
 * Golden tower / chain lightning / death wave block: ids 60–66.
 * Black hole damage labs and others use scattered ids (see MANUAL_ANCHORS in gen script).
 */
export const ULTIMATE_RESEARCH_LEVEL_ID_BY_LAB_NAME = {
  'Missile Despawn Time': 50,
  'Missiles Explosion': 51,
  'Missile Radius': 52,
  'Chrono Field Duration': 53,
  'Chrono Field Damage Reduction': 54,
  'Chrono Field Reduction %': 55,
  'Swamp Radius': 56,
  'Swamp Stun': 57,
  'Swamp Stun Chance': 58,
  'Swamp Stun Time': 59,
  'Golden Tower Bonus': 60,
  'Golden Tower Duration': 61,
  'Chain Lightning Shock': 62,
  'Shock Chance': 63,
  'Shock Multiplier': 64,
  'Death Wave Health': 65,
  'Death Wave Coin Bonus': 66,
  'Inner Mine Blast Radius': 67,
  'Inner Mine Rotation Speed': 68,
  'Chrono Field Range': 69,
  'Missile Amplifier': 90,
  'Missile Barrage': 91,
  'Missile Barrage Quantity': 92,
  'Inner Mine Stun': 93,
  'Black Hole Damage': 94,
  'Extra Black Hole': 95,
  'Black Hole Coin Bonus': 96,
  'Spotlight Coin Bonus': 97,
  'Spotlight Missiles': 98,
  'Black Hole Disable Ranged Enemies': 132,
  'Recharge Missile Barrage': 147,
  'Swamp Rend - Basic Enemies': 156,
  'Swamp Rend - Additional Enemies': 157,
  'Chain Thunder': 158,
  'Lightning Amplifier - Scatter': 159,
  'Death Wave Cells Bonus': 190,
  'Death Wave Damage Amplifier': 191,
  'Death Wave Armor Stripping': 192,
} as const satisfies Record<string, number>

export type UltimateResearchLabName = keyof typeof ULTIMATE_RESEARCH_LEVEL_ID_BY_LAB_NAME
