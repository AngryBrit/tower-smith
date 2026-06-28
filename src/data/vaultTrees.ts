/**
 * The Vault — Power (tower-related buffs) and Harmony (QoL / non-tower buffs) tech
 * trees. Keys are earned via Legends League placements; upgrades start at the root
 * and branch outward.
 *
 * This data is transcribed from in-game screenshots + the community upgrade tables.
 * It is NOT `tables/` GOD data, so it lives here and can be edited freely.
 *
 * Layout: `order` is the unlock index where 0 = root. In game the root sits at the
 * BOTTOM and the tree grows upward, so the page renders rows in reverse `order`.
 * `total` is the displayed cumulative "keys total" used to validate the parent chain
 * (see vaultTrees.test.ts).
 */
import type { StringId } from '../i18n/dictionary'

export type VaultTreeId = 'harmony' | 'power'
export type VaultColumn = 'left' | 'middle' | 'right'
export type VaultNodeKind = 'upgrade' | 'tierUnlock'
export type VaultTierGate = 't2' | 't3'

export type VaultNode = {
  id: string
  tree: VaultTreeId
  column: VaultColumn
  order: number
  iconId: string
  /** Short value shown on/under the tile and substituted into the description. */
  valueLabel: string
  nameId: StringId
  descId: StringId
  /** Tier-1 key cost. Tier 2 costs x2, tier 3 costs x4. */
  keyCost: number
  /** Displayed cumulative "keys total"; null when the game shows none (tier unlocks). */
  total: number | null
  parentId: string | null
  /** Nodes with a single level only (no T2/T3). */
  oneLevelOnly?: boolean
  kind: VaultNodeKind
  /** For tier-unlock nodes: which global tier they unlock. */
  tierGate?: VaultTierGate
}

/** Tier cost multipliers: T1 x1, T2 x2, T3 x4. */
export const VAULT_TIER_COST_MULTIPLIER = [0, 1, 2, 4] as const

/** Tier x2 unlock requires this many tier-1 Power unlocks. */
export const VAULT_TIER2_REQ_T1 = 15
/** Tier x3 unlock requires this many tier-1 and tier-2 Power unlocks. */
export const VAULT_TIER3_REQ_T1 = 30
export const VAULT_TIER3_REQ_T2 = 15

export function vaultMaxTier(node: VaultNode): 1 | 3 {
  return node.oneLevelOnly || node.kind === 'tierUnlock' ? 1 : 3
}

export function vaultKeyCostForTier(node: VaultNode, tier: 1 | 2 | 3): number {
  return node.keyCost * VAULT_TIER_COST_MULTIPLIER[tier]
}

// ---------------------------------------------------------------------------
// Harmony tree
// ---------------------------------------------------------------------------

const HARMONY_NODES: VaultNode[] = [
  // Middle spine: alternating Enhancements / Rerolls discounts, 5 keys each.
  m('h-m1', 'harmony', 0, 'discount-enhancements', '2.5%', 'discount_enhancements', 5, 5, null),
  m('h-m2', 'harmony', 1, 'discount-rerolls', '2.5%', 'discount_rerolls', 5, 10, 'h-m1'),
  m('h-m3', 'harmony', 2, 'discount-enhancements', '2.5%', 'discount_enhancements', 5, 15, 'h-m2'),
  m('h-m4', 'harmony', 3, 'discount-rerolls', '2.5%', 'discount_rerolls', 5, 20, 'h-m3'),
  m('h-m5', 'harmony', 4, 'discount-enhancements', '2.5%', 'discount_enhancements', 5, 25, 'h-m4'),
  m('h-m6', 'harmony', 5, 'discount-rerolls', '2.5%', 'discount_rerolls', 5, 30, 'h-m5'),
  m('h-m7', 'harmony', 6, 'discount-enhancements', '2.5%', 'discount_enhancements', 5, 35, 'h-m6'),
  m('h-m8', 'harmony', 7, 'discount-rerolls', '2.5%', 'discount_rerolls', 5, 40, 'h-m7'),
  m('h-m9', 'harmony', 8, 'discount-enhancements', '2.5%', 'discount_enhancements', 5, 45, 'h-m8'),
  m('h-m10', 'harmony', 9, 'discount-rerolls', '2.5%', 'discount_rerolls', 5, 50, 'h-m9'),
  m('h-m11', 'harmony', 10, 'discount-enhancements', '2.5%', 'discount_enhancements', 5, 55, 'h-m10'),
  m('h-m12', 'harmony', 11, 'discount-rerolls', '2.5%', 'discount_rerolls', 5, 60, 'h-m11'),
  m('h-m13', 'harmony', 12, 'discount-enhancements', '2.5%', 'discount_enhancements', 5, 65, 'h-m12'),
  m('h-m14', 'harmony', 13, 'discount-rerolls', '2.5%', 'discount_rerolls', 5, 70, 'h-m13'),
  m('h-m15', 'harmony', 14, 'discount-enhancements', '2.5%', 'discount_enhancements', 5, 75, 'h-m14'),
  m('h-m16', 'harmony', 15, 'discount-rerolls', '2.5%', 'discount_rerolls', 5, 80, 'h-m15'),
  m('h-m17', 'harmony', 16, 'discount-enhancements', '2.5%', 'discount_enhancements', 5, 85, 'h-m16'),

  // Left branch
  h('h-l-cardslot1', 'left', 1, 'card-slot', '+1', 'card_slot', 10, 20, 'h-m2'),
  h('h-l-freemission', 'left', 2, 'free-mission-reroll', '1', 'free_mission_reroll', 25, 40, 'h-m3'),
  h('h-l-nuke', 'left', 3, 'nuke-automation', '', 'nuke_automation', 10, 30, 'h-m4'),
  h('h-l-smartnuke', 'left', 4, 'smart-nuke-automation', '', 'smart_nuke_automation', 15, 45, 'h-l-nuke'),
  h('h-l-cardslot2', 'left', 5, 'card-slot', '+1', 'card_slot', 15, 45, 'h-m6'),
  h('h-l-adgems2', 'left', 6, 'ad-gems-2', 'x2', 'ad_gems_2', 15, 50, 'h-m7'),
  h('h-l-adgems3', 'left', 7, 'ad-gems-3', 'x3', 'ad_gems_3', 20, 70, 'h-l-adgems2'),
  h('h-l-adgems5', 'left', 8, 'ad-gems-5', 'x5', 'ad_gems_5', 25, 95, 'h-l-adgems3'),
  h('h-l-cardslot3', 'left', 9, 'card-slot', '+1', 'card_slot', 25, 75, 'h-m10'),
  h('h-l-dailymission', 'left', 10, 'daily-mission-shard', '', 'daily_mission_shard', 35, 90, 'h-m11'),
  h('h-l-autorestart', 'left', 11, 'auto-restart-run', '', 'auto_restart_run', 20, 80, 'h-m12'),
  h('h-l-botrespec1', 'left', 13, 'bot-respec-discount', '100', 'bot_respec_discount', 15, 85, 'h-m14'),
  h('h-l-botrespec2', 'left', 14, 'bot-respec-discount', '100', 'bot_respec_discount', 20, 105, 'h-l-botrespec1'),
  h('h-l-botrespec3', 'left', 15, 'bot-respec-discount', '100', 'bot_respec_discount', 25, 130, 'h-l-botrespec2'),
  h('h-l-botpresets', 'left', 16, 'bot-presets', '+3', 'bot_presets', 50, 180, 'h-l-botrespec3'),

  // Right branch
  h('h-r-demon', 'right', 1, 'demon-mode-automation', '', 'demon_mode_automation', 10, 20, 'h-m2'),
  h('h-r-smartdemon', 'right', 2, 'smart-demon-mode-automation', '', 'smart_demon_mode_automation', 15, 35, 'h-r-demon'),
  h('h-r-wsrespec1', 'right', 3, 'workshop-respec-discount', '50', 'workshop_respec_discount', 15, 35, 'h-m4'),
  h('h-r-wsrespec2', 'right', 4, 'workshop-respec-discount', '50', 'workshop_respec_discount', 20, 55, 'h-r-wsrespec1'),
  h('h-r-wsrespec3', 'right', 5, 'workshop-respec-discount', '50', 'workshop_respec_discount', 25, 80, 'h-r-wsrespec2'),
  h('h-r-wspresets', 'right', 6, 'workshop-presets', '+5', 'workshop_presets', 30, 110, 'h-r-wsrespec3'),
  h('h-r-cardslot1', 'right', 7, 'card-slot', '+1', 'card_slot', 20, 60, 'h-m8'),
  h('h-r-missile', 'right', 8, 'missile-barrage-automation', '', 'missile_barrage_automation', 10, 55, 'h-m9'),
  h('h-r-smartmissile', 'right', 9, 'smart-missile-barrage-automation', '', 'smart_missile_barrage_automation', 15, 70, 'h-r-missile'),
  h('h-r-autoshatter', 'right', 10, 'auto-shatter-modules', '', 'auto_shatter_modules', 25, 80, 'h-m11'),
  h('h-r-cardslot2', 'right', 11, 'card-slot', '+1', 'card_slot', 35, 95, 'h-m12'),
  h('h-r-berzerker', 'right', 12, 'auto-charge-berzerker', '', 'auto_charge_berzerker', 10, 75, 'h-m13'),
  h('h-r-damagecap', 'right', 13, 'damage-cap-slider', '', 'damage_cap_slider', 35, 110, 'h-r-berzerker'),
  h('h-r-orbadjuster', 'right', 14, 'workshop-orb-adjuster', '', 'workshop_orb_adjuster', 20, 95, 'h-r-berzerker'),
  h('h-r-cardslot3', 'right', 15, 'card-slot', '+1', 'card_slot', 45, 125, 'h-m16'),
  h('h-r-cooldown', 'right', 16, 'bot-cooldown-sliders', '', 'bot_cooldown_sliders', 25, 110, 'h-m17'),
]

// ---------------------------------------------------------------------------
// Power tree
// ---------------------------------------------------------------------------

const POWER_NODES: VaultNode[] = [
  // Middle spine
  one('p-m1', 'power', 0, 'ultimate-damage', '5%', 'ultimate_damage', 15, 15, null),
  one('p-m2', 'power', 1, 'bot-range', '2m', 'bot_range', 20, 35, 'p-m1'),
  p('p-m3', 'middle', 2, 'damage-meter', '5%', 'damage_meter', 10, 45, 'p-m2'),
  p('p-m4', 'middle', 3, 'critical-chance', '1%', 'critical_chance', 15, 60, 'p-m3'),
  p('p-m5', 'middle', 4, 'damage', '5%', 'damage', 15, 75, 'p-m4'),
  p('p-m6', 'middle', 5, 'super-crit-chance', '2%', 'super_crit_chance', 25, 100, 'p-m5'),
  one('p-m7', 'power', 6, 'ultimate-damage', '5%', 'ultimate_damage', 15, 115, 'p-m6'),
  one('p-m8', 'power', 7, 'bot-range', '2m', 'bot_range', 20, 135, 'p-m7'),
  p('p-m9', 'middle', 8, 'rend-armor-mult', '5%', 'rend_armor_mult', 20, 155, 'p-m8'),
  p('p-m10', 'middle', 9, 'critical-factor', '5%', 'critical_factor', 25, 180, 'p-m9'),
  p('p-m11', 'middle', 10, 'attack-speed', '5%', 'attack_speed', 25, 205, 'p-m10'),
  p('p-m12', 'middle', 11, 'super-crit-mult', '5%', 'super_crit_mult', 25, 230, 'p-m11'),
  one('p-m13', 'power', 12, 'ultimate-damage', '5%', 'ultimate_damage', 15, 245, 'p-m12'),
  one('p-m14', 'power', 13, 'bot-range', '2m', 'bot_range', 20, 265, 'p-m13'),
  p('p-m15', 'middle', 14, 'rend-armor-chance', '4%', 'rend_armor_chance', 15, 280, 'p-m14'),
  p('p-m16', 'middle', 15, 'rapid-fire-chance', '4%', 'rapid_fire_chance', 15, 295, 'p-m15'),
  p('p-m17', 'middle', 16, 'multishot-chance', '4%', 'multishot_chance', 20, 315, 'p-m16'),
  p('p-m18', 'middle', 17, 'bounce-shot-chance', '4%', 'bounce_shot_chance', 25, 340, 'p-m17'),
  one('p-m19', 'power', 18, 'ultimate-damage', '5%', 'ultimate_damage', 20, 360, 'p-m18'),
  one('p-m20', 'power', 19, 'bot-range', '2m', 'bot_range', 20, 380, 'p-m19'),

  // Section 1 left wing (defense)
  p('p-l-defense-abs', 'left', 2, 'defense-absolute', '5%', 'defense_absolute', 5, 40, 'p-m2'),
  p('p-l-health-regen', 'left', 3, 'health-regen', '5%', 'health_regen', 10, 50, 'p-l-defense-abs'),
  p('p-l-health', 'left', 4, 'health', '5%', 'health', 15, 65, 'p-l-health-regen'),
  p('p-l-defense-pct', 'left', 5, 'defense-percent', '0.5%', 'defense_percent', 25, 90, 'p-l-health'),
  // Section 1 right wing (economy) + Tier x2
  p('p-r-cash', 'right', 2, 'cash', '5%', 'cash', 5, 40, 'p-m2'),
  p('p-r-coins-kill', 'right', 3, 'coins-kill', '5%', 'coins_kill', 15, 55, 'p-r-cash'),
  p('p-r-enemy-atk-skip', 'right', 4, 'enemy-attack-skip', '0.5%', 'enemy_attack_skip', 25, 80, 'p-r-coins-kill'),
  p('p-r-enemy-hp-skip', 'right', 5, 'enemy-health-skip', '0.5%', 'enemy_health_skip', 25, 105, 'p-r-enemy-atk-skip'),
  tier('p-tier2', 6, 'tier-x2', 'tier2_unlock', 50, 'p-r-enemy-hp-skip', 't2'),

  // Section 2 left wing
  p('p-l-thorn', 'left', 8, 'thorn-damage', '5%', 'thorn_damage', 20, 155, 'p-m8'),
  p('p-l-knockback-force', 'left', 9, 'knockback-force', '5%', 'knockback_force', 25, 180, 'p-l-thorn'),
  p('p-l-orb-speed', 'left', 10, 'orb-speed', '5%', 'orb_speed', 25, 205, 'p-l-knockback-force'),
  one('p-l-wall-rebuild', 'power', 11, 'wall-rebuild', '-20s', 'wall_rebuild', 25, 230, 'p-l-orb-speed', 'left'),
  // Section 2 right wing + Tier x3
  p('p-r-recovery', 'right', 8, 'recovery-amount', '5%', 'recovery_amount', 15, 150, 'p-m8'),
  p('p-r-free-atk', 'right', 9, 'free-attack-upgrade', '5%', 'free_attack_upgrade', 25, 175, 'p-r-recovery'),
  p('p-r-free-def', 'right', 10, 'free-defense-upgrade', '5%', 'free_defense_upgrade', 25, 200, 'p-r-free-atk'),
  p('p-r-free-util', 'right', 11, 'free-utility-upgrade', '5%', 'free_utility_upgrade', 25, 225, 'p-r-free-def'),
  tier('p-tier3', 12, 'tier-x3', 'tier3_unlock', 100, 'p-r-free-util', 't3'),

  // Section 3 left wing
  p('p-l-knockback-chance', 'left', 14, 'knockback-chance', '2%', 'knockback_chance', 20, 285, 'p-m14'),
  one('p-l-shockwave', 'power', 15, 'shockwave-frequency', '-1s', 'shockwave_frequency', 20, 305, 'p-l-knockback-chance', 'left'),
  p('p-l-death-defy', 'left', 16, 'death-defy', '2%', 'death_defy', 25, 330, 'p-l-shockwave'),
  one('p-l-orbs', 'power', 17, 'orbs', '1', 'orbs', 30, 360, 'p-l-death-defy', 'left'),
  // Section 3 right wing (wave economy)
  p('p-r-max-recovery', 'right', 14, 'max-recovery', '20%', 'max_recovery', 10, 275, 'p-m14'),
  p('p-r-interest', 'right', 15, 'interest-wave', '100%', 'interest_wave', 10, 285, 'p-r-max-recovery'),
  p('p-r-cash-wave', 'right', 16, 'cash-wave', '100%', 'cash_wave', 10, 295, 'p-r-interest'),
  p('p-r-coins-wave', 'right', 17, 'coins-wave', '100%', 'coins_wave', 10, 305, 'p-r-cash-wave'),
]

// ---------------------------------------------------------------------------
// Builders (kept terse so the tables above stay readable)
// ---------------------------------------------------------------------------

function nameId(type: string): StringId {
  return `vault_name_${type}` as StringId
}
function descId(type: string): StringId {
  return `vault_desc_${type}` as StringId
}

/** Harmony middle-spine node (single purchase). */
function m(
  id: string,
  tree: VaultTreeId,
  order: number,
  iconId: string,
  valueLabel: string,
  type: string,
  keyCost: number,
  total: number,
  parentId: string | null,
): VaultNode {
  return {
    id,
    tree,
    column: 'middle',
    order,
    iconId,
    valueLabel,
    nameId: nameId(type),
    descId: descId(type),
    keyCost,
    total,
    parentId,
    oneLevelOnly: true,
    kind: 'upgrade',
  }
}

/** Harmony branch node (single purchase). */
function h(
  id: string,
  column: VaultColumn,
  order: number,
  iconId: string,
  valueLabel: string,
  type: string,
  keyCost: number,
  total: number,
  parentId: string,
): VaultNode {
  return {
    id,
    tree: 'harmony',
    column,
    order,
    iconId,
    valueLabel,
    nameId: nameId(type),
    descId: descId(type),
    keyCost,
    total,
    parentId,
    oneLevelOnly: true,
    kind: 'upgrade',
  }
}

/** Power node with full T1/T2/T3 tiers. */
function p(
  id: string,
  column: VaultColumn,
  order: number,
  iconId: string,
  valueLabel: string,
  type: string,
  keyCost: number,
  total: number,
  parentId: string,
): VaultNode {
  return {
    id,
    tree: 'power',
    column,
    order,
    iconId,
    valueLabel,
    nameId: nameId(type),
    descId: descId(type),
    keyCost,
    total,
    parentId,
    kind: 'upgrade',
  }
}

/** Power single-level node (UW Damage, Bot Range, Wall Rebuild, Shockwave, Orbs). */
function one(
  id: string,
  tree: VaultTreeId,
  order: number,
  iconId: string,
  valueLabel: string,
  type: string,
  keyCost: number,
  total: number,
  parentId: string | null,
  column: VaultColumn = 'middle',
): VaultNode {
  return {
    id,
    tree,
    column,
    order,
    iconId,
    valueLabel,
    nameId: nameId(type),
    descId: descId(type),
    keyCost,
    total,
    parentId,
    oneLevelOnly: true,
    kind: 'upgrade',
  }
}

/** Power tier-unlock node. */
function tier(
  id: string,
  order: number,
  iconId: string,
  type: string,
  keyCost: number,
  parentId: string,
  tierGate: VaultTierGate,
): VaultNode {
  return {
    id,
    tree: 'power',
    column: 'right',
    order,
    iconId,
    valueLabel: '',
    nameId: nameId(type),
    descId: descId(type),
    keyCost,
    total: null,
    parentId,
    oneLevelOnly: true,
    kind: 'tierUnlock',
    tierGate,
  }
}

export const VAULT_NODES: readonly VaultNode[] = [...HARMONY_NODES, ...POWER_NODES]

export const VAULT_NODES_BY_TREE: Readonly<Record<VaultTreeId, readonly VaultNode[]>> = {
  harmony: HARMONY_NODES,
  power: POWER_NODES,
}

const NODE_BY_ID = new Map(VAULT_NODES.map((n) => [n.id, n]))

export function vaultNodeById(id: string): VaultNode | undefined {
  return NODE_BY_ID.get(id)
}

export function vaultParentOf(node: VaultNode): VaultNode | undefined {
  return node.parentId ? NODE_BY_ID.get(node.parentId) : undefined
}

export const VAULT_MAX_ORDER: Readonly<Record<VaultTreeId, number>> = {
  harmony: Math.max(...HARMONY_NODES.map((n) => n.order)),
  power: Math.max(...POWER_NODES.map((n) => n.order)),
}
