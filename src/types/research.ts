import {
  formatAssistModuleLabCoinDisplay,
  formatLabCoinDisplay,
  isAssistModuleLabName,
  normalizeCoinAbbrevDisplay,
  toolkitMarginalCoinCost,
  toolkitUpgradeDurationSeconds,
} from '../labCosts'
import cardMasteryTierLabels from '../data/card-mastery-tier-labels.json'

export type ResearchState = 'default' | 'max' | 'researching'

export interface ResearchItem {
  name: string
  level: string
  benefit: string
  time: string
  cost: string
  state: ResearchState
  /** Snapshot level from export JSON; used for bounds when present. */
  currentLevel?: number
  maxLevel?: number
  /** Raw total coins to max from export; optional metadata (not used for marginal cost). */
  coinsToMaxRaw?: number
  /** Legacy export field; ignored for marginal coin (toolkit only). */
  costPlusOne?: string
  /** Wiki: power stones to unlock this card’s mastery on the cards screen (Card Mastery section only). */
  stoneUnlockCost?: number
}

function applyLabsCoinDiscountToCoins(
  rawCoins: number,
  labsCoinDiscountPercent: number,
): number {
  if (!Number.isFinite(rawCoins) || rawCoins < 0) return rawCoins
  const mult = 1 - labsCoinDiscountPercent / 100
  if (!Number.isFinite(mult)) return rawCoins
  return Math.max(0, rawCoins * mult)
}

/**
 * Marginal cost for the **next** upgrade at the simulated `effectiveLevel`.
 * Source: bundled `tower-labs.json` (per-lab per-level `COST`). Missing lab or level → **—**.
 *
 * **Card Mastery** labs (`* Mastery`): the cost line shows **wiki stone unlock** (`stoneUnlockCost`
 * on the row), not coin-style lab ladder totals. **Labs Coin Discount** does not apply.
 *
 * Other labs: `labsCoinDiscountPercent` is total Labs Coin Discount % from the simulated Labs Coin
 * Discount lab level (list price × (1 − pct/100)). The **Labs Coin Discount** row itself is never
 * discounted (wiki: discount applies to all other labs only).
 */
export function marginalCostForNextUpgrade(
  item: ResearchItem,
  effectiveLevel: number,
  maxLevelCap: number,
  labsCoinDiscountPercent = 0,
): string {
  if (maxLevelCap > 0 && effectiveLevel >= maxLevelCap) return 'Max'

  const isCardMastery = item.name.endsWith(' Mastery')
  if (isCardMastery) {
    const s = item.stoneUnlockCost
    if (typeof s === 'number' && Number.isFinite(s) && s >= 0) {
      return String(Math.round(s))
    }
    return '—'
  }

  const fromToolkit = toolkitMarginalCoinCost(item.name, effectiveLevel)
  if (fromToolkit != null) {
    const discount =
      item.name === 'Labs Coin Discount' ? 0 : labsCoinDiscountPercent
    const discounted = applyLabsCoinDiscountToCoins(fromToolkit, discount)
    return isAssistModuleLabName(item.name)
      ? formatAssistModuleLabCoinDisplay(discounted)
      : formatLabCoinDisplay(discounted)
  }

  return '—'
}

/**
 * Discounted coin cost for the upgrade **from** `fromLevel` **to** `fromLevel + 1`
 * (same rules as {@link marginalCostForNextUpgrade}, but numeric). Returns `undefined` for
 * card mastery, maxed labs, or labs/levels missing from `tower-labs.json`.
 */
export function rawDiscountedMarginalCoinAtCurrentLevel(
  item: ResearchItem,
  fromLevel: number,
  maxLevelCap: number,
  labsCoinDiscountPercent: number,
): number | undefined {
  if (maxLevelCap > 0 && fromLevel >= maxLevelCap) return undefined
  if (isCardMasteryResearchItem(item)) return undefined

  const fromToolkit = toolkitMarginalCoinCost(item.name, fromLevel)
  if (fromToolkit != null) {
    const discount =
      item.name === 'Labs Coin Discount' ? 0 : labsCoinDiscountPercent
    return applyLabsCoinDiscountToCoins(fromToolkit, discount)
  }

  return undefined
}

/** True for Card Mastery lab rows (`Damage Mastery`, …). */
export function isCardMasteryResearchItem(item: { name: string }): boolean {
  return item.name.endsWith(' Mastery')
}

/** Numeric bounds for +/- controls (falls back when optional fields missing). */
export function getLevelBounds(item: ResearchItem): {
  current: number
  max: number
} {
  if (
    typeof item.currentLevel === 'number' &&
    typeof item.maxLevel === 'number' &&
    item.maxLevel >= 0
  ) {
    const max = item.maxLevel
    const current = Math.min(Math.max(0, item.currentLevel), max)
    return { current, max }
  }

  const numeric = /^Lv\.(\d+)$/.exec(item.level.trim())
  if (numeric) {
    const c = parseInt(numeric[1], 10)
    const max =
      typeof item.maxLevel === 'number' ? item.maxLevel : Math.max(c, 0)
    return { current: Math.min(c, max), max }
  }

  if (/Max/i.test(item.level)) {
    const mx = typeof item.maxLevel === 'number' ? item.maxLevel : 1
    return { current: mx, max: mx }
  }

  return {
    current: 0,
    max: typeof item.maxLevel === 'number' ? item.maxLevel : 0,
  }
}

export function formatLevelLabel(level: number, max: number): string {
  if (max > 0 && level >= max) return 'Lv. Max'
  return `Lv.${level}`
}

/**
 * Game Speed lab **Value** (wiki; max **7** levels): **Lv.0 → x1.0**, **Lv.1→x2.0** … **Lv.7→x5.0**
 * in steps of **0.5**. In-game max with perks/labs can exceed this (e.g. **6.25** shown **6.3**); this
 * card reflects the lab ladder only.
 */
export function gameSpeedMultiplierLabel(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  if (maxLevelCap <= 0) return '—'
  const clamped = Math.min(Math.max(0, effectiveLevel), maxLevelCap)
  if (clamped === 0) return 'x1.0'
  const mult = 2 + (clamped - 1) * 0.5
  return `x${mult.toFixed(1)}`
}

/**
 * Labs Speed — wiki **Value**: **1.00 + 0.02 × lab level** as **`x`** (Lv.0→**x1.00**, Lv.1→**x1.02** … Lv.99→**x2.98**).
 * Max **99** levels (Milestones tier 1 wave 150). Cost/time in `tower-labs.json` under **`Lab Speed`** (display name **Labs Speed** aliases here).
 * Multiplier applies to research **time** on all other labs (not Labs Speed itself).
 */
export function labsSpeedMultiplierAtLevel(
  effectiveLevel: number,
  maxLevelCap: number,
): number {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return 1 + 0.02 * capped
}

export function labsSpeedValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  return `x${labsSpeedMultiplierAtLevel(effectiveLevel, maxLevelCap).toFixed(2)}`
}

function moduleLabCappedLevel(
  effectiveLevel: number,
  maxLevelCap: number,
): number {
  return maxLevelCap > 0
    ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
    : Math.max(0, effectiveLevel)
}

/** Single-level unlock labs: Lv.0 → prompt; Lv.≥1 → **Unlocked** (wiki **Value** column at level 1). */
export const UNLOCK_LAB_LV0_LABELS: Record<string, string> = {
  'More Round Stats': 'Unlock Round Stats',
  'Card Presets': 'Unlock Card Presets',
  'Package After Boss': 'Unlock Package After Boss',
  'Workshop Respec': 'Unlock Workshop Respec',
  'Reroll Daily Mission': 'Unlock Reroll Daily Mission',
  'Workshop Enhancements': 'Unlock Workshop Enhancements',
  /** Wiki Light Speed Shots: Milestones tier 7 wave 10; single level Unlocked (instant travel; untargeted enemy between tower and target can block and take damage). Marginal L1: 0d 19h 59m, 3,000,000 coins (`tower-labs.json`). */
  'Light Speed Shots': 'Unlock Light Speed Shots',
  'Missiles Explosion': 'Unlock Missiles Explosion',
  'Chrono Field Damage Reduction': 'Unlock Chrono Field Damage Reduction',
  'Swamp Stun': 'Unlock Swamp Stun',
  'Chain Lightning Shock': 'Unlock Chain Lightning Shock',
  'Missile Barrage': 'Unlock Missile Barrage',
  'Inner Mine Stun': 'Unlock Inner Mine Stun',
  'Extra Black Hole': 'Unlock Extra Black Hole',
  'Black Hole Disable Ranged Enemies': 'Unlock Black Hole Disable Ranged Enemies',
  'Extra Orb Adjuster': 'Unlock Extra Orb Adjuster',
  'Unlock Perks': 'Unlock Perks',
  'Auto Pick Perks': 'Unlock Auto Pick Perks',
  'First Perk Choice': 'Unlock First Perk Choice',
  'Unmerge Module': 'Unlock Module Unmerge',
}

function isUnlockLabItem(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(UNLOCK_LAB_LV0_LABELS, name)
}

function benefitLineShowsCurrentBenefitOnly(itemName: string): boolean {
  return isUnlockLabItem(itemName) || itemName === 'Target Priority'
}

/** Lv.0 → mapped prompt; Lv.≥1 → **Unlocked** (wiki **Value**); unknown lab → `null`. */
export function unlockLabBenefitDisplay(
  itemName: string,
  effectiveLevel: number,
  maxLevelCap: number,
): string | null {
  const lv0 = UNLOCK_LAB_LV0_LABELS[itemName]
  if (lv0 === undefined) return null
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  if (capped <= 0) return lv0
  return 'Unlocked'
}

/**
 * Target Priority — three-stage lab (max **2**): **Unlock** → **Better** → **Unlocked**.
 */
export function targetPriorityBenefitDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  if (capped <= 0) return 'Unlock Target Priority'
  if (capped === 1) return 'Better Target Priority'
  return 'Unlocked'
}

/** Wiki **Value** by lab level (max **4**): Lv.0→**x1**, Lv.1→**x5**, Lv.2→**x10**, Lv.3→**Max**, Lv.4→**x100** (tier 2 wave 20). */
export function buyMultiplierValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  switch (capped) {
    case 0:
      return 'x1'
    case 1:
      return 'x5'
    case 2:
      return 'x10'
    case 3:
      return 'Max'
    case 4:
      return 'x100'
    default:
      return capped < 0 ? 'x1' : 'x100'
  }
}

/** BC Groups 1–4 resistance / BC reduction labs — wiki **Value**: **1% × lab level** (Lv.0→**0%**; cap by **maxLevel**). */
export function battleConditionsGroup1ResistanceValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return `${capped}%`
}

/** Battle Condition Reduction — wiki **Value**: **2% × lab level** (Lv.0→**0%** … Lv.10→**20%**). */
export function battleConditionReductionValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return `${(capped * 2).toFixed(0)}%`
}

/**
 * Numeric **Damage-style** lab multiplier: **1 + 0.02 × capped level** (Attack **Damage** max **100**→**3.00**).
 */
export function damageStyleLabMultiplier(
  effectiveLevel: number,
  maxLevelCap: number,
): number {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return 1 + 0.02 * capped
}

/**
 * Damage-style labs (+0.02/level multiplier): **Damage** (max **100**→x3.00), **Attack Speed** (max **99**→x2.98),
 * **Range** (max **80**→x2.60; wiki **Tier 2 wave 30**), **Damage / Meter** (max **99**→x2.98; wiki **Tier 3 wave 30**),
 * **Super Crit Mult**, **Cash Bonus**, **Cash / Wave**, **Coins / Kill Bonus**, **Coins / Wave**,
 * **Interest** (Lv.1→x1.02 … Lv.99→x2.98; Damage **100** levels Lv.100→x3.00; **Super Crit Mult** max **40**→x1.80, wiki unlock **Tier 5 wave 200** with **Super Crit Chance**).
 */
export function damageValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const mult = damageStyleLabMultiplier(effectiveLevel, maxLevelCap)
  return `x${mult.toFixed(2)}`
}

/**
 * Numeric **Health-style** lab multiplier: **1 + 0.03 × capped level** (Defense **Health** /
 * **Health Regen** max **100**→**4.00**; **Critical Factor** max **99**→**3.97**).
 */
export function healthStyleLabMultiplier(
  effectiveLevel: number,
  maxLevelCap: number,
): number {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return 1 + 0.03 * capped
}

/**
 * Critical Factor / **Health-style** labs — **Value**: **x1.00** at Lv.0, **+0.03 × effective level**
 * (Lv.1→x1.03 … **Critical Factor** max **99**→x3.97; **Health** / **Health Regen** max **100**→x4.00).
 * Marginal **Time** / **Coins** for **Critical Factor** match **Damage** levels **1–99** in `tower-labs.json`.
 */
export function criticalFactorValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const mult = healthStyleLabMultiplier(effectiveLevel, maxLevelCap)
  return `x${mult.toFixed(2)}`
}

/**
 * Super Crit Chance — **+0.10% × lab level** with Include **%**.
 * Marginal **Time** / **Coins** through **50** levels live in `tower-labs.json` (wiki unlock **Tier 5 wave 200** with **Super Crit Mult**).
 */
export function superCritChancePercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const pct = 0.1 * capped
  return `+${pct.toFixed(2)}%`
}

/**
 * Orbs Speed — same **0.10 × lab level** stepping as the calculator **Value** column; display **`+`** only (no **`%`**).
 */
export function orbsSpeedPlusValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 0.1 * capped
  return `+${v.toFixed(2)}`
}

/**
 * Shockwave Size — calculator **Value**: **+0.05 × lab level**; **`+`** only (no **`%`**).
 * Lv.0→**+0.00**; higher levels trim redundant **`.0`** (e.g. **+0.1**, **+1**).
 */
export function shockwaveSizePlusDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  if (capped <= 0) return '+0.00'
  const hundredths = Math.round(capped * 5)
  const v = hundredths / 100
  const s = parseFloat(v.toFixed(2)).toString()
  return `+${s}`
}

/**
 * Shock Chance — same numeric curve as the calculator **Value** column (**2.50 + 0.50 × lab level**),
 * shown with **`%`** (e.g. Lv.0→**2.50%**, Lv.1→**3.00%** … Lv.30→**17.50%**).
 */
export function shockChanceValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 2.5 + 0.5 * capped
  return `${v.toFixed(2)}%`
}

/**
 * Shock Multiplier — same numeric curve as the calculator **Value** column (**1.10 + 0.04 × lab level**),
 * shown with **`x`** (e.g. Lv.0→**x1.10**, Lv.1→**x1.14** … Lv.14→**x1.66**).
 */
export function shockMultiplierValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 1.1 + 0.04 * capped
  return `x${v.toFixed(2)}`
}

/**
 * Death Wave Health — same curve as the calculator **Value** with Include **%**:
 * **500 + 25 × lab level**; whole-number **%** only (e.g. Lv.0→**500%**, Lv.1→**525%** … Lv.30→**1250%**).
 */
export function deathWaveHealthPercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 500 + 25 * capped
  return `${v}%`
}

/**
 * Death Wave Coin Bonus — calculator **Value**: **1.50 + 0.05 × lab level** as **`x`** multiplier
 * (Lv.0→**x1.50** … Lv.20→**x2.50**).
 */
export function deathWaveCoinBonusMultiplierDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 1.5 + 0.05 * capped
  return `x${v.toFixed(2)}`
}

/**
 * Death Wave Cells Bonus — calculator **Value**: **1.00 + 0.10 × lab level** as **`x`** multiplier
 * (Lv.0→**x1.00** … Lv.20→**x3.00**); wiki caps extra cell bonus at **×3** on enemies from enhancement waves / Death Wave.
 */
export function deathWaveCellsBonusMultiplierDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 1.0 + 0.1 * capped
  return `x${v.toFixed(2)}`
}

/**
 * Death Wave Damage Amplifier — calculator **Value**: **5.00 + 1.50 × lab level** as **`x`**
 * (Lv.0→**x5.00**, Lv.1→**x6.50** … Lv.30→**x50.00**); wiki caps at **+50×** Death Wave damage per Effect Wave on a target.
 */
export function deathWaveDamageAmplifierDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 5.0 + 1.5 * capped
  return `x${v.toFixed(2)}`
}

/**
 * Death Wave Armor Stripping — calculator **Value**: **1.00 × lab level** (Lv.0→**0.00** … Lv.10→**10.00**);
 * wiki max armor stripped per hit caps at **10**.
 */
export function deathWaveArmorStrippingDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 1.0 * capped
  return v.toFixed(2)
}

/**
 * Inner Mine Blast Radius — in-game style **+1.40 + 0.10 × lab level** (Lv.0→**+1.40**, Lv.1→**+1.50** … Lv.20→**+3.40**).
 */
export function innerMineBlastRadiusValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 1.4 + 0.1 * capped
  return `+${v.toFixed(2)}`
}

/**
 * Inner Mine Rotation Speed — calculator **Value**: **0.80 × lab level** (Lv.0→**0.00** … Lv.20→**16.00**).
 */
export function innerMineRotationSpeedValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return (0.8 * capped).toFixed(2)
}

/**
 * Inner Land Mine - Chrono Jump — Tower Lab calculator **Value**: **5s × lab level** charge boost
 * (per wiki; Lv.0→**0s**, Lv.1→**5s** … Lv.10→**50s**).
 */
export function innerLandMineChronoJumpChargeSecondsDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const sec = 5 * capped
  return `${sec}s`
}

/** Defense % lab bonus in **whole percent points** (Lv.1→**0.2** … same as calculator **Value**). */
export function defensePercentLabPercentPoints(
  effectiveLevel: number,
  maxLevelCap: number,
): number {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return 0.2 * capped
}

/**
 * Defense % — Tower Lab Calculator **Value** with Include **%**: **+0.20% × lab level**.
 */
export function defensePercentValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const pct = defensePercentLabPercentPoints(effectiveLevel, maxLevelCap)
  return `+${pct.toFixed(2)}%`
}

/**
 * Orb Boss Hit — Tower Lab **Value**: **0.20% × lab level** of boss max HP as orb damage (two decimals, no **`+`**;
 * Lv.0→**0.00%** … Lv.10→**2.00%**).
 */
export function orbBossHitPercentValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const pct = 0.2 * capped
  return `${pct.toFixed(2)}%`
}

/**
 * Extra Extra Orbs — Tower Lab **Value**: **+1 × lab level** (Lv.0→**+0**, Lv.1→**+1**, Lv.2→**+2**).
 */
export function extraExtraOrbsBonusDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return `+${capped}`
}

/**
 * Energy Shield Extra Hit — Tower Lab **Value** column: extra hit count **= lab level**
 * (Lv.0→**0**, Lv.1→**1**, Lv.2→**2**).
 */
export function energyShieldExtraHitCountDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return String(capped)
}

/**
 * Waves Required — Tower Lab **Value**: **−1 × lab level** as plain integers (**Lv.0→`0`**; **Lv.1→`-1`** … **Lv.100→`-100`**; upgrade lines like **`-5 » -6`**).
 */
export function wavesRequiredReductionDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  if (capped <= 0) return '0'
  return String(-capped)
}

/**
 * Bot **Cooldown** labs — **Value**: **−n seconds** as **`-{n}s`** (**Lv.0→`0s`**; **Lv.1→`-1s`** …; e.g. **`-23s » -24s`**).
 * **Bot Bot - Cooldown** (wiki **Bot Bot Cooldown**): Milestones **tier 6 wave 90**, **25** levels (−**25**s total); marginal **Time** / **Coins** in `tower-labs.json` (same ladder as other bot cooldown labs).
 */
export function botCooldownReductionSecondsDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  if (capped <= 0) return '0s'
  return `${-capped}s`
}

/**
 * **Golden Bot - Duration** (and **Amplify Bot - Duration** / **Bot Bot - Duration**) —
 * **Value**: **+0.5s × lab level** as **`+{…}s`** (e.g. **Lv.0→`+0s`**, **Lv.1→`+0.5s`** … **Lv.20→`+10s`**).
 */
export function goldBotDurationValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  if (capped <= 0) return '+0s'
  const sec = capped / 2
  if (Number.isInteger(sec)) return `+${sec}s`
  return `+${sec.toFixed(1)}s`
}

/**
 * **Thunder Bot - Linger Time** — **Value**: **+3.00s base + 0.5s × lab level** as **`+{…}s`**
 * (Lv.0→**`+3s`** … Lv.20→**`+13s`**; wiki **3.50 … 13.00** at Lv.1…20).
 */
export function thunderBotLingerValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const sec = 3 + capped / 2
  if (Number.isInteger(sec)) return `+${sec}s`
  return `+${sec.toFixed(1)}s`
}

/**
 * Flame Bot - Burn Stack — **Value**: max burn stacks **= 2 + lab level**
 * (Lv.0→**2**; Lv.1→**3** … Lv.5→**7**).
 */
export function flameBotBurnStackMaxDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return String(2 + capped)
}

/**
 * Tower Lab calculator **Value** when **Include %** is on: **+pctPerLevel% × lab level**
 * (Lv.0→+0.00%; Lv.1→+pctPerLevel formatted to two decimals).
 *
 * Used by Recovery Package labs, **Enemy Attack Level Skip**, **Enemy Health Level Skip**, etc.
 */
export function includePercentTimesLabLevelDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
  pctPerLevel: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const pct = pctPerLevel * capped
  return `+${pct.toFixed(2)}%`
}

/**
 * **Common** / **Fast** / **Tank** / **Ranged** enemy Health & Attack, **Fast** Speed,
 * **Ray Enemy Attack** / **Ray Enemy Health** / **Vampire Enemy Attack** / **Vampire Enemy Health** /
 * **Scatter Enemy Attack** / **Scatter Enemy Health** — **-0.40% × lab level** (Lv.30→**-12.00%**).
 */
export function commonEnemyStatReductionPercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  if (capped <= 0) return '-0.00%'
  const pct = -0.4 * capped
  return `${pct.toFixed(2)}%`
}

/**
 * **Boss** / **Protector Health** / **Protector Radius** / **Protector Damage Reduction** —
 * **-0.30% × lab level** (Lv.30→**-9.00%** when `maxLevelCap` is 30; **Protector Damage Reduction** max 20→**-6.00%**).
 */
export function bossEnemyStatReductionPercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  if (capped <= 0) return '-0.00%'
  const pct = -0.3 * capped
  return `${pct.toFixed(2)}%`
}

/**
 * **Ranged Enemy Range** — **-0.50% × lab level** (Lv.30→**-15.00%**).
 */
export function rangedEnemyRangeReductionPercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  if (capped <= 0) return '-0.00%'
  const pct = -0.5 * capped
  return `${pct.toFixed(2)}%`
}

/**
 * Wall Health — Tower Lab Calculator **Value** with Include **%**: **+2.00% × lab level**
 * (Lv.1→+2.00% … Lv.50→+100.00%).
 */
export function wallHealthPercentValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const pct = 2 * capped
  return `+${pct.toFixed(2)}%`
}

/**
 * Wall Regen — Tower Lab Calculator **Value** with Include **%**: **+10.00% × lab level**
 * (Lv.1→+10.00% … Lv.30→+300.00%).
 */
export function wallRegenPercentValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const pct = 10 * capped
  return `+${pct.toFixed(2)}%`
}

/**
 * Wall Thorns — Tower Lab Calculator **Value** with Include **%**: **+1.00% × lab level**
 * (Lv.1→+1.00% … Lv.20→+20.00%).
 */
export function wallThornsPercentValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const pct = capped
  return `+${pct.toFixed(2)}%`
}

/**
 * Wall Fortification — Tower Lab Calculator **Value** with Include **%**: **+20.00% × lab level**
 * (Lv.1→+20.00% … Lv.60→+1200.00%).
 */
export function wallFortificationPercentValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const pct = 20 * capped
  return `+${pct.toFixed(2)}%`
}

/** Garlic Thorns lab bonus in **whole percent points** (Lv.1→**0.5** … max Lv.10→**5.0**). */
export function garlicThornsLabPercentPoints(
  effectiveLevel: number,
  maxLevelCap: number,
): number {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return 0.5 * capped
}

/**
 * Garlic Thorns — calculator **Value** with Include **%**: **+0.5% × lab level**, **one** decimal (Lv.1→+0.5% … Lv.10→+5.0%).
 */
export function garlicThornsPercentValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const pct = garlicThornsLabPercentPoints(effectiveLevel, maxLevelCap)
  return `+${pct.toFixed(1)}%`
}

/**
 * Land Mine Damage — Tower Lab Calculator **Value** with Include **%**: **+10% × lab level**
 * (whole-number display: **+0%** … **+200%**).
 */
export function landMineDamagePercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const pct = 10 * capped
  return `+${Math.round(pct)}%`
}

/**
 * Black Hole Damage — Tower Lab calculator **Value**: **0.20% × lab level** of enemy max health per tick
 * (Lv.0→**0.00%**, Lv.1→**0.20%** … Lv.10→**2.00%**); two decimals and **`%`** only (no **`+`**).
 */
export function blackHoleDamagePercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const pct = 0.2 * capped
  return `${pct.toFixed(2)}%`
}

/**
 * Black Hole Coin Bonus — calculator **Value**: **1.00 + 0.50 × lab level** as coin multiplier (**`x`**)
 * (Lv.0→**x1.00**, Lv.1→**x1.50** … Lv.20→**x11.00**).
 */
export function blackHoleCoinBonusMultiplierDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 1 + 0.5 * capped
  return `x${v.toFixed(2)}`
}

/**
 * Spotlight Missiles — Tower Lab calculator **Value**: missile fire interval **20.00 − lab level** (seconds),
 * two decimals + **`s`** from Lv.1 (Lv.0→**Unlock Spotlight Missiles**, Lv.1→**19.00s** … Lv.18→**2.00s**).
 */
export function spotlightMissilesIntervalDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  if (capped <= 0) return 'Unlock Spotlight Missiles'
  const v = 20 - capped
  return `${v.toFixed(2)}s`
}

/**
 * Spotlight Coin Bonus — calculator **Value**: **1.00 + 0.10 × lab level** as **`x`** multiplier
 * (Lv.0→**x1.00**, Lv.1→**x1.10** … Lv.20→**x3.00**).
 */
export function spotlightCoinBonusMultiplierDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 1 + 0.1 * capped
  return `x${v.toFixed(2)}`
}

/**
 * Land Mine Decay — Tower Lab Calculator **Value**: **+0.50s × lab level** (seconds), shown as **`+`…`s`**.
 * (Lv.1→+0.50s … Lv.35→+17.50s).
 */
export function landMineDecaySecondsDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const sec = 0.5 * capped
  return `+${sec.toFixed(2)}s`
}

/**
 * Missile Despawn Time — Tower Lab calculator **Value** column: **1…20** (= lab level; Lv.0→**0**).
 */
export function missileDespawnTimeSecondsDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return String(capped)
}

/**
 * Missile Amplifier — same numeric curve as the calculator **Value** (**1.00 + 1.50 × lab level**),
 * shown with **`x`** (e.g. Lv.0→**x1.00**, Lv.1→**x2.50** … Lv.25→**x38.50**).
 */
export function missileAmplifierValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 1 + 1.5 * capped
  return `x${v.toFixed(2)}`
}

/**
 * Missile Barrage Quantity — Tower Lab calculator **Value**: **20 + 5 × lab level**
 * (Lv.0→**20**, Lv.1→**25** … Lv.6→**50**).
 */
export function missileBarrageQuantityValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return String(20 + 5 * capped)
}

/**
 * Recharge Missile Barrage — Tower Lab calculator **Value** by level (wiki table;
 * Lv.0→**1750 waves**, Lv.1→**1500 waves** … Lv.7→**200 waves**).
 */
const RECHARGE_MISSILE_BARRAGE_VALUES = [
  1750, 1500, 1250, 1000, 750, 500, 350, 200,
] as const

export function rechargeMissileBarrageValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const idx = Math.min(capped, RECHARGE_MISSILE_BARRAGE_VALUES.length - 1)
  const n = RECHARGE_MISSILE_BARRAGE_VALUES[idx]
  return `${n} waves`
}

/**
 * Second Wind Blast — Tower Lab calculator **Value**: **25% × lab level** of enemies cleared
 * (Lv.0→**0%**, Lv.1→**25%** … Lv.4→**100%**).
 */
export function secondWindBlastPercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return `${25 * capped}%`
}

/** Wiki **Value**: waves until Second Wind can recharge again (Lv.0→**—**). */
const RECHARGE_SECOND_WIND_WAVE_VALUES = [
  2000, 1500, 1250, 1000, 750, 550, 400,
] as const

/**
 * Recharge Second Wind — Tower Lab calculator **Value** by level (wiki table; Lv.1→**2000 waves** … Lv.7→**400 waves**).
 */
export function rechargeSecondWindValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  if (capped <= 0) return '—'
  const idx =
    Math.min(capped, RECHARGE_SECOND_WIND_WAVE_VALUES.length) - 1
  const n = RECHARGE_SECOND_WIND_WAVE_VALUES[idx]
  return n !== undefined ? `${n} waves` : '—'
}

/** Wiki **Value**: waves until Demon Mode can recharge again (Lv.0→**—**). */
const RECHARGE_DEMON_MODE_WAVE_VALUES = [
  1500, 1250, 1000, 750, 550, 400, 300,
] as const

/**
 * Recharge Demon Mode — Tower Lab calculator **Value** by level (wiki table; Lv.1→**1500 waves** … Lv.7→**300 waves**).
 */
export function rechargeDemonModeValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  if (capped <= 0) return '—'
  const idx =
    Math.min(capped, RECHARGE_DEMON_MODE_WAVE_VALUES.length) - 1
  const n = RECHARGE_DEMON_MODE_WAVE_VALUES[idx]
  return n !== undefined ? `${n} waves` : '—'
}

/**
 * Recharge Nuke — same **Value** curve as Recharge Demon Mode (**1500 waves** … **300 waves**; Lv.0→**—**).
 */
export function rechargeNukeValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  return rechargeDemonModeValueDisplay(effectiveLevel, maxLevelCap)
}

/**
 * Double Death Ray — Tower Lab **Chance** column: **1% × lab level** (integer **`%`** only;
 * Lv.0→**0%**, Lv.1→**1%** … Lv.30→**30%**).
 */
export function doubleDeathRayChancePercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return `${capped}%`
}

/**
 * Chrono Field Duration — Tower Lab calculator **Value** column: **1.00 × lab level**
 * (Lv.0→**0.00** … Lv.30→**30.00**); plain decimals (no **`+`** / **`s`**).
 */
export function chronoFieldDurationSecondsDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return capped.toFixed(2)
}

/**
 * Chrono Field Range — same numeric curve as the calculator **Value** (**3.00 × lab level**),
 * shown with **`+`** and **`m`** (e.g. Lv.7→**+21.00m**, Lv.8→**+24.00m** … Lv.20→**+60.00m**).
 */
export function chronoFieldRangeValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return `+${(3 * capped).toFixed(2)}m`
}

/**
 * Golden Tower Duration — Tower Lab calculator **Value**: **+1.00s × lab level** (display **one** decimal like Wall Invincibility: Lv.20→+20.0s).
 */
export function goldenTowerDurationSecondsDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return `+${capped.toFixed(1)}s`
}

/**
 * Chrono Field Reduction % — Tower Lab calculator **Value** (Include **%**):
 * **10.00% + 0.50% × lab level** (Lv.0→**10.00%**, Lv.1→**10.50%** … Lv.30→**25.00%**); no **`+`** prefix on the string.
 */
export function chronoFieldReductionPercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const pct = 10 + 0.5 * capped
  return `${pct.toFixed(2)}%`
}

/**
 * Missile Radius — Tower Lab calculator **Value**: **0.30 + 0.05 × lab level** (two decimals; Lv.0→0.30, Lv.1→0.35 … Lv.20→1.30).
 */
export function missileRadiusValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 0.3 + 0.05 * capped
  return v.toFixed(2)
}

/**
 * Swamp Radius — Tower Lab calculator **Value**: **+0.04 × lab level** (two decimals; Lv.0→+0.00 … Lv.30→+1.20).
 */
export function swampRadiusPlusDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 0.04 * capped
  return `+${v.toFixed(2)}`
}

/**
 * Swamp Stun Chance — Tower Lab calculator **Value** (Include **%**):
 * **+5.00% + 2.50% × lab level** (Lv.0→+5.00%, Lv.1→+7.50% … Lv.30→+80.00%).
 */
export function swampStunChancePercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const pct = 5 + 2.5 * capped
  return `+${pct.toFixed(2)}%`
}

/**
 * Swamp Stun Time — Tower Lab calculator **Value** (**+`…`s**): **+1.00s + 0.30s × lab level**
 * (Lv.0→+1.00s, Lv.1→+1.30s … Lv.30→+10.00s).
 */
export function swampStunTimeValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 1.0 + 0.3 * capped
  return `+${v.toFixed(2)}s`
}

/** Wiki / calculator order for **Swamp Rend - Additional Enemies** (one label per lab level 1…6). */
const SWAMP_REND_ADDITIONAL_ENEMY_LABELS: readonly string[] = [
  'Ranged enemies',
  'Fast enemies',
  'Tank Enemies',
  'Protector Enemies',
  'Boss Enemies',
  'Vampire',
]

/**
 * Tower Lab calculator **Value**: **3% × lab level** (whole-number **`%`** only).
 * **Swamp Rend - Basic Enemies** (basic rend %) and **Chain Thunder** (max damage reduction vs health lost from Chain Lightning).
 */
export function threePercentTimesLabLevelPercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return `${3 * capped}%`
}

/**
 * Swamp Rend - Basic Enemies — same **Value** as {@link threePercentTimesLabLevelPercentDisplay}.
 */
export function swampRendPercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  return threePercentTimesLabLevelPercentDisplay(effectiveLevel, maxLevelCap)
}

/**
 * Lightning Amplifier - Scatter — calculator **Value**: **1.25 × lab level** as **`x`** (Lv.0→**x0**;
 * wiki level 1→**x1.25** … 30→**x37.5**); trims redundant **`.0`** (e.g. **x5**, **x10**).
 */
export function lightningAmplifierScatterMultiplierDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 1.25 * capped
  const s = parseFloat(v.toFixed(2)).toString()
  return `x${s}`
}

/**
 * Swamp Rend - Additional Enemies — discrete **Value** per wiki level (Lv.0→**—**, then one enemy type per level).
 */
export function swampRendAdditionalEnemiesDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  if (capped <= 0) return '—'
  const idx =
    Math.min(capped, SWAMP_REND_ADDITIONAL_ENEMY_LABELS.length) - 1
  return SWAMP_REND_ADDITIONAL_ENEMY_LABELS[idx] ?? '—'
}

/**
 * Golden Tower Bonus — Tower Lab calculator **Value**: **0.15 × lab level** (two decimals with **+** prefix; Lv.0→+0.00 … Lv.25→+3.75).
 */
export function goldenTowerBonusValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 0.15 * capped
  return `+${v.toFixed(2)}`
}

/**
 * Super Tower Bonus — Tower Lab calculator **Value**: **1.00 + 0.03 × lab level** as **`x`** multiplier
 * (Lv.0→**x1.00**, Lv.1→**x1.03** … Lv.30→**x1.90**).
 */
export function superTowerBonusMultiplierDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 1 + 0.03 * capped
  return `x${v.toFixed(2)}`
}

/**
 * Wall Invincibility — Tower Lab Calculator **Value**: **+1.0s × lab level** (one decimal; Lv.1→+1.0s … Lv.10→+10.0s).
 */
export function wallInvincibilitySecondsDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return `+${capped.toFixed(1)}s`
}

/**
 * Wall Rebuild — Tower Lab Calculator **Value** (seconds): **−10s × lab level**, shown with **one** decimal (e.g. **−50.0s**).
 */
export function wallRebuildSecondsDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const mag = (10 * capped).toFixed(1)
  return `-${mag}s`
}

/**
 * Max Rend Armor Multiplier (wiki **Rend Armor Max**) — raw **Value** is **800 + 25 × lab level** (percent points);
 * display as **`x` + (that ÷ 100)** with **three decimals** (Lv.0→**x8.000** … Lv.30→**x15.500** = **1550%**).
 * Wiki unlock **Tier 13 wave 10**; max **30** levels; marginal **Time** / **Coins** in `tower-labs.json`.
 */
export function maxRendArmorMultiplierValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const raw = 800 + 25 * capped
  const mult = raw / 100
  return `x${mult.toFixed(3)}`
}

/**
 * Total Labs Coin Discount % at the given lab level — wiki **Value**: **0.30% × lab level**
 * (Lv.0→0.00% … Lv.99→29.70%). Max **99** levels (Milestones tier 1 wave 30). Cost/time per step in `tower-labs.json`.
 */
const LAB_COIN_DISCOUNT_PCT_PER_LEVEL = 0.3

/** Total Labs Coin Discount % at a given lab level (same formula as the benefit line). */
export function labsCoinDiscountTotalPercent(
  effectiveLevel: number,
  maxLevelCap: number,
): number {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return capped * LAB_COIN_DISCOUNT_PCT_PER_LEVEL
}

/** Omit `0d` when under 24h; omit `0h` when under 1h. */
function formatResearchDurationDhm(d: number, h: number, m: number): string {
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/** **365-day** years, remainder as days/h/m; omits zero tail parts (wiki Dissonant Echo ladder). */
function formatResearchDurationYdh(y: number, d: number, h: number, m: number): string {
  const parts: string[] = [`${y}y`]
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  return parts.join(' ')
}

function formatResearchDurationSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—'
  const totalMin = Math.floor(seconds / 60)
  const minPerYear = 365 * 24 * 60
  const y = Math.floor(totalMin / minPerYear)
  if (y > 0) {
    const remMin = totalMin - y * minPerYear
    const d = Math.floor(remMin / (24 * 60))
    const h = Math.floor((remMin % (24 * 60)) / 60)
    const m = remMin % 60
    return formatResearchDurationYdh(y, d, h, m)
  }
  const d = Math.floor(totalMin / (60 * 24))
  const h = Math.floor((totalMin % (60 * 24)) / 60)
  const m = totalMin % 60
  return formatResearchDurationDhm(d, h, m)
}

/**
 * Starting Cash — wiki **Value**: **5 × lab level** dollars (Lv.0→**+$0**, Lv.1→**+$5** … Lv.99→**+$495**);
 * max **99** levels (Milestones tier 1 wave 30). Cost/time steps **1–99** come from `tables/labs/main/starting-cash.json`.
 */
export function startingCashValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return `+$${5 * capped}`
}

/** Tower Lab calculator **Value** (Include %): **$** amounts per level (Lv.0→$50 … Lv.15→$15000). */
const MAX_INTEREST_VALUE_USD_BY_LEVEL = [
  50, 100, 200, 300, 500, 700, 1000, 1500, 2000, 2500, 3500, 5000, 7500, 10000,
  12500, 15000,
] as const

export function maxInterestDollarValueDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const idx = Math.min(
    capped,
    MAX_INTEREST_VALUE_USD_BY_LEVEL.length - 1,
  )
  const v = MAX_INTEREST_VALUE_USD_BY_LEVEL[idx]
  return `$${v}`
}

/** Labs whose wiki **Value** is **0.50% × lab level** (Lv.0→0.00% … Lv.99→49.50%). */
const WORKSHOP_DISCOUNT_VALUE_LABS = new Set([
  'Workshop Attack Discount',
  'Workshop Defense Discount',
  'Workshop Utility Discount',
])

/**
 * Enhancement Attack/Defense/Utility coin discount — three independent labs, **one shared marginal ladder**
 * in `tower-labs.json` (see `scripts/gen-enhancement-coin-discount-labs.mjs`). Wiki unlock **Tier 21 wave 60**;
 * max **100** levels; **Value** is **0.30% × lab level** (Lv.100→30.00%).
 */
const ENHANCEMENT_COIN_DISCOUNT_LABS = new Set([
  'Enhancement Attack - Coin Discount',
  'Enhancement Defense - Coin Discount',
  'Enhancement Utility - Coin Discount',
])

/**
 * Dissonant Echo — one lab per category (Attack / Defense / Utility / Ultimate Weapons).
 * In-game **Value** is echo chance: **0.50% × (lab level + 1)** (Lv.0→0.50%, Lv.1→1.00%, Lv.20→10.50%; wiki table Level 1…20).
 * Wiki cost table rows 1–20 match toolkit marginal levels (see `scripts/gen-dissonant-echo-labs.mjs`).
 * Wiki per-tier echo boost scales as `(Dissonance Boost − 1) × lab percentage` (additive across tiers).
 */
const DISSONANT_ECHO_LABS = new Set([
  'Dissonant Echo - Attack',
  'Dissonant Echo - Defense',
  'Dissonant Echo - Utility',
  'Dissonant Echo - Ultimate Weapons',
])

/**
 * Workshop Attack/Defense/Utility discount — wiki **Value**: **0.50% × lab level**
 * (Lv.1→0.50% … Lv.99→49.50%; Lv.0→0.00%). Max **99** levels; cost/time from `tables/labs/main/workshop-*-discount.json`.
 * Unlock milestones differ by lab (wiki: **Attack** tier 1 wave 40; **Defense** tier 2 wave 50; **Utility** tier 2 wave 60).
 */
/** Total Workshop Attack/Defense/Utility discount % at a given lab level. */
export function workshopDiscountTotalPercent(
  effectiveLevel: number,
  maxLevelCap: number,
): number {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return 0.5 * capped
}

export function workshopDiscountValuePercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  return `${workshopDiscountTotalPercent(effectiveLevel, maxLevelCap).toFixed(2)}%`
}

/** List price × (1 − discount%/100) for workshop upgrade coins. */
export function applyWorkshopDiscountToCoins(
  rawCoins: number,
  workshopDiscountPercent: number,
): number {
  if (!Number.isFinite(rawCoins) || rawCoins < 0) return rawCoins
  const mult = 1 - workshopDiscountPercent / 100
  if (!Number.isFinite(mult)) return rawCoins
  return Math.max(0, rawCoins * mult)
}

/**
 * Enhancement coin discount labs — **0.30%** per effective lab level (Lv.100→30.00%).
 * Marginal **Time** / **Coins** (cost **×1.3** per level from **1 B**) are in `tower-labs.json`
 * (`scripts/gen-enhancement-coin-discount-labs.mjs`).
 */
export function enhancementCoinDiscountValuePercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const v = 0.3 * capped
  return `${v.toFixed(2)}%`
}

/**
 * Dissonant Echo labs — wiki **Value** = **0.50% × (lab level + 1)** (Lv.1→1.00% … Lv.20→10.50%).
 * Marginal **Time** / **Coins** (cost **×2.25** per level from **1 q**) live in `tower-labs.json`
 * (see `scripts/gen-dissonant-echo-labs.mjs`).
 */
export function dissonantEchoBoostChancePercentDisplay(
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  const v = dissonantEchoBoostChancePercentValue(effectiveLevel, maxLevelCap)
  return `${v.toFixed(2)}%`
}

/** Echo chance % at simulator lab level (matches wiki table Level = effectiveLevel). */
export function dissonantEchoBoostChancePercentValue(
  effectiveLevel: number,
  maxLevelCap: number,
): number {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return 0.5 * (capped + 1)
}

const TIER_BENEFIT_RE = /^T(\d+)\s+(\d+)$/

/** Parsed `T{n} {m}` milestone from the CSV snapshot benefit string (tier + wave; not lab level). */
export function parseTierBenefitSnapshot(benefitStr: string): {
  tier: number
  value: number
} | null {
  const m = TIER_BENEFIT_RE.exec(benefitStr.trim())
  if (!m) return null
  const tier = parseInt(m[1], 10)
  const value = parseInt(m[2], 10)
  if (!Number.isFinite(tier) || !Number.isFinite(value)) return null
  return { tier, value }
}

/** `T{n} {wave}` — unlock milestone only; does not change when simulating lab level. */
function tierStyleBenefitDisplay(item: ResearchItem): string | null {
  const parsed = parseTierBenefitSnapshot(item.benefit)
  if (!parsed) return null
  return `T${parsed.tier} ${parsed.value}`
}

const KMH_BENEFIT_RE = /^([\d.]+)\s*K\/h$/i

const CARD_MASTERY_TIER_LABELS = cardMasteryTierLabels as Record<
  string,
  readonly string[]
>

function cardMasteryBenefitDisplay(
  itemName: string,
  effectiveLevel: number,
  maxLevelCap: number,
): string | null {
  if (!itemName.endsWith(' Mastery')) return null
  const tiers = CARD_MASTERY_TIER_LABELS[itemName]
  if (!tiers?.length) return null
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const idx = Math.min(capped, tiers.length - 1)
  return tiers[idx] ?? null
}

/** “Cph” style `12.34 K/h` — approximate next tiers by moving **1%/level** of the snapshot rate per simulated level step from the import row. */
function kmhStyleBenefitDisplay(
  item: ResearchItem,
  effectiveLevel: number,
  maxLevelCap: number,
): string | null {
  const m = KMH_BENEFIT_RE.exec(item.benefit.trim())
  if (!m) return null
  const v0 = parseFloat(m[1])
  if (!Number.isFinite(v0)) return null
  const baseLv = item.currentLevel ?? 0
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  const steps = capped - baseLv
  const perLevel = v0 * 0.01
  const v = v0 + perLevel * steps
  return `${v.toFixed(2)} K/h`
}

/** Benefit line on the card: dynamic where we can derive it; otherwise CSV snapshot `item.benefit`. */
export function benefitDisplayForCard(
  item: ResearchItem,
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  if (item.name === 'Game Speed') {
    return gameSpeedMultiplierLabel(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Labs Speed') {
    return labsSpeedValueDisplay(effectiveLevel, maxLevelCap)
  }
  const unlock = unlockLabBenefitDisplay(
    item.name,
    effectiveLevel,
    maxLevelCap,
  )
  if (unlock !== null) return unlock
  if (item.name === 'Target Priority') {
    return targetPriorityBenefitDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Buy Multiplier') {
    return buyMultiplierValueDisplay(effectiveLevel, maxLevelCap)
  }
  const cardMastery = cardMasteryBenefitDisplay(
    item.name,
    effectiveLevel,
    maxLevelCap,
  )
  if (cardMastery !== null) return cardMastery
  if (item.name === 'Battle Condition Reduction') {
    return battleConditionReductionValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (
    item.name === 'Knockback Resistance' ||
    item.name === 'Thorns Resistance' ||
    item.name === 'Orb Resistance' ||
    item.name === 'Plasma Cannon Resistance' ||
    item.name === 'Death Ray Resistance' ||
    item.name === 'Armored Enemies' ||
    item.name === 'Enemy Speed' ||
    item.name === 'More Enemies' ||
    item.name === 'Enemy Attack Speed' ||
    item.name === "Fast's Ultimate" ||
    item.name === 'Ranged Ultimate' ||
    item.name === "Boss's Ultimate" ||
    item.name === "Basic's Ultimate" ||
    item.name === "Tank's Ultimate" ||
    item.name === "Protector's Ultimate" ||
    item.name === 'Ultimate Weapon Durations' ||
    item.name === 'Death Defy Down' ||
    item.name === 'Energy Shields Down' ||
    item.name === 'Enemy Level Skip Reduction'
  ) {
    return battleConditionsGroup1ResistanceValueDisplay(
      effectiveLevel,
      maxLevelCap,
    )
  }
  if (
    item.name === 'Damage' ||
    item.name === 'Attack Speed' ||
    item.name === 'Range' ||
    item.name === 'Damage / Meter' ||
    item.name === 'Super Crit Mult' ||
    item.name === 'Cash Bonus' ||
    item.name === 'Cash / Wave' ||
    item.name === 'Coins / Kill Bonus' ||
    item.name === 'Coins / Wave' ||
    item.name === 'Interest'
  ) {
    return damageValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (
    item.name === 'Critical Factor' ||
    item.name === 'Health' ||
    item.name === 'Health Regen' ||
    item.name === 'Defense Absolute'
  ) {
    return criticalFactorValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Super Crit Chance') {
    return superCritChancePercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Orbs Speed') {
    return orbsSpeedPlusValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Shockwave Size') {
    return shockwaveSizePlusDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Defense %') {
    return defensePercentValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Orb Boss Hit') {
    return orbBossHitPercentValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Wall Health') {
    return wallHealthPercentValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Wall Regen') {
    return wallRegenPercentValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Wall Thorns') {
    return wallThornsPercentValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Wall Fortification') {
    return wallFortificationPercentValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Garlic Thorns') {
    return garlicThornsPercentValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Wall Invincibility') {
    return wallInvincibilitySecondsDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Wall Rebuild') {
    return wallRebuildSecondsDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Land Mine Damage') {
    return landMineDamagePercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Black Hole Damage') {
    return blackHoleDamagePercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Black Hole Coin Bonus') {
    return blackHoleCoinBonusMultiplierDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Spotlight Missiles') {
    return spotlightMissilesIntervalDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Spotlight Coin Bonus') {
    return spotlightCoinBonusMultiplierDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Land Mine Decay') {
    return landMineDecaySecondsDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Missile Despawn Time') {
    return missileDespawnTimeSecondsDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Missile Amplifier') {
    return missileAmplifierValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Missile Barrage Quantity') {
    return missileBarrageQuantityValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Recharge Missile Barrage') {
    return rechargeMissileBarrageValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Second Wind Blast') {
    return secondWindBlastPercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Recharge Second Wind') {
    return rechargeSecondWindValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Recharge Demon Mode') {
    return rechargeDemonModeValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Recharge Nuke') {
    return rechargeNukeValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Double Death Ray') {
    return doubleDeathRayChancePercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Extra Extra Orbs') {
    return extraExtraOrbsBonusDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Perk Option Quantity') {
    return extraExtraOrbsBonusDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Waves Required') {
    return wavesRequiredReductionDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Standard Perks Bonus') {
    return doubleDeathRayChancePercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Improve Trade-off Perks') {
    return doubleDeathRayChancePercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (
    item.name === 'Flame Bot - Cooldown' ||
    item.name === 'Thunder Bot - Cooldown' ||
    item.name === 'Golden Bot - Cooldown' ||
    item.name === 'Gold Bot - Cooldown' ||
    item.name === 'Amplify Bot - Cooldown' ||
    item.name === 'Amp Bot - Cooldown' ||
    item.name === 'Bot Bot - Cooldown'
  ) {
    return botCooldownReductionSecondsDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Flame Bot - Burn Stack') {
    return flameBotBurnStackMaxDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Thunder Bot - Linger Time') {
    return thunderBotLingerValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (
    item.name === 'Golden Bot - Duration' ||
    item.name === 'Gold Bot - Duration' ||
    item.name === 'Amplify Bot - Duration' ||
    item.name === 'Amp Bot - Duration' ||
    item.name === 'Bot Bot - Duration'
  ) {
    return goldBotDurationValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Energy Shield Extra Hit') {
    return energyShieldExtraHitCountDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Ban Perks') {
    return energyShieldExtraHitCountDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Auto Pick Ranking') {
    return energyShieldExtraHitCountDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Chrono Field Duration') {
    return chronoFieldDurationSecondsDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Chrono Field Range') {
    return chronoFieldRangeValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Golden Tower Duration') {
    return goldenTowerDurationSecondsDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Chrono Field Reduction %') {
    return chronoFieldReductionPercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Missile Radius') {
    return missileRadiusValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Swamp Radius') {
    return swampRadiusPlusDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Swamp Stun Chance') {
    return swampStunChancePercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Swamp Stun Time') {
    return swampStunTimeValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Swamp Rend - Basic Enemies') {
    return threePercentTimesLabLevelPercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Swamp Rend - Additional Enemies') {
    return swampRendAdditionalEnemiesDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Chain Thunder') {
    return threePercentTimesLabLevelPercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Lightning Amplifier - Scatter') {
    return lightningAmplifierScatterMultiplierDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Super Tower Bonus') {
    return superTowerBonusMultiplierDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Golden Tower Bonus') {
    return goldenTowerBonusValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Shock Chance') {
    return shockChanceValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Shock Multiplier') {
    return shockMultiplierValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Death Wave Health') {
    return deathWaveHealthPercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Death Wave Coin Bonus') {
    return deathWaveCoinBonusMultiplierDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Death Wave Cells Bonus') {
    return deathWaveCellsBonusMultiplierDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Death Wave Damage Amplifier') {
    return deathWaveDamageAmplifierDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Death Wave Armor Stripping') {
    return deathWaveArmorStrippingDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Inner Mine Blast Radius') {
    return innerMineBlastRadiusValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Inner Mine Rotation Speed') {
    return innerMineRotationSpeedValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Inner Land Mine - Chrono Jump') {
    return innerLandMineChronoJumpChargeSecondsDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Max Rend Armor Multiplier') {
    return maxRendArmorMultiplierValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Labs Coin Discount') {
    return `${labsCoinDiscountTotalPercent(effectiveLevel, maxLevelCap).toFixed(2)}%`
  }
  if (item.name === 'Starting Cash') {
    return startingCashValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Max Interest') {
    return maxInterestDollarValueDisplay(effectiveLevel, maxLevelCap)
  }
  if (WORKSHOP_DISCOUNT_VALUE_LABS.has(item.name)) {
    return workshopDiscountValuePercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (ENHANCEMENT_COIN_DISCOUNT_LABS.has(item.name)) {
    return enhancementCoinDiscountValuePercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (DISSONANT_ECHO_LABS.has(item.name)) {
    return dissonantEchoBoostChancePercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Recovery Package Max') {
    return includePercentTimesLabLevelDisplay(
      effectiveLevel,
      maxLevelCap,
      1,
    )
  }
  if (item.name === 'Recovery Package Chance') {
    return includePercentTimesLabLevelDisplay(
      effectiveLevel,
      maxLevelCap,
      0.2,
    )
  }
  if (item.name === 'Recovery Package Amount') {
    return includePercentTimesLabLevelDisplay(
      effectiveLevel,
      maxLevelCap,
      0.4,
    )
  }
  if (item.name === 'Ranged Enemy Range') {
    return rangedEnemyRangeReductionPercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (
    item.name === 'Common Enemy Health' ||
    item.name === 'Common Enemy Attack' ||
    item.name === 'Fast Enemy Health' ||
    item.name === 'Fast Enemy Attack' ||
    item.name === 'Fast Enemy Speed' ||
    item.name === 'Tank Enemy Health' ||
    item.name === 'Tank Enemy Attack' ||
    item.name === 'Ranged Enemy Health' ||
    item.name === 'Ranged Enemy Attack' ||
    item.name === 'Ray Enemy Attack' ||
    item.name === 'Ray Enemy Health' ||
    item.name === 'Vampire Enemy Attack' ||
    item.name === 'Vampire Enemy Health' ||
    item.name === 'Scatter Enemy Attack' ||
    item.name === 'Scatter Enemy Health'
  ) {
    return commonEnemyStatReductionPercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (
    item.name === 'Boss Health' ||
    item.name === 'Boss Attack' ||
    item.name === 'Protector Health' ||
    item.name === 'Protector Radius' ||
    item.name === 'Protector Damage Reduction'
  ) {
    return bossEnemyStatReductionPercentDisplay(effectiveLevel, maxLevelCap)
  }
  if (
    item.name === 'Enemy Attack Level Skip' ||
    item.name === 'Enemy Health Level Skip'
  ) {
    return includePercentTimesLabLevelDisplay(
      effectiveLevel,
      maxLevelCap,
      0.1,
    )
  }
  if (item.name === 'Common Drop Chance' || item.name === 'Rare Drop Chance') {
    const capped = moduleLabCappedLevel(effectiveLevel, maxLevelCap)
    return `+${(capped * 0.1).toFixed(2)}%`
  }
  if (item.name === 'Reroll Shards' || item.name === 'Daily Mission Shards') {
    const capped = moduleLabCappedLevel(effectiveLevel, maxLevelCap)
    return `+${capped}`
  }
  if (item.name === 'Module Shards Cost' || item.name === 'Module Coin Cost') {
    const capped = moduleLabCappedLevel(effectiveLevel, maxLevelCap)
    if (capped <= 0) return '0%'
    return `-${capped}%`
  }
  if (item.name === 'Shatter Shards') {
    const capped = moduleLabCappedLevel(effectiveLevel, maxLevelCap)
    if (capped <= 0) return '0%'
    return `+${capped * 20}%`
  }
  if (
    item.name.startsWith('Assist Module Substats - ') ||
    item.name.startsWith('Assist Module Bonus - ')
  ) {
    const capped = moduleLabCappedLevel(effectiveLevel, maxLevelCap)
    return `${capped}%`
  }
  if (
    item.name === 'Cannon Effect Bans' ||
    item.name === 'Armor Effect Bans' ||
    item.name === 'Generator Effect Bans' ||
    item.name === 'Core Effect Bans'
  ) {
    const capped = moduleLabCappedLevel(effectiveLevel, maxLevelCap)
    return String(capped)
  }

  const tier = tierStyleBenefitDisplay(item)
  if (tier != null) return tier

  const kmh = kmhStyleBenefitDisplay(item, effectiveLevel, maxLevelCap)
  if (kmh != null) return kmh

  return item.benefit
}

function nextBenefitDisplayForUpgradeLine(
  item: ResearchItem,
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  return benefitDisplayForCard(item, effectiveLevel + 1, maxLevelCap)
}

/**
 * **current » simulated benefit at level + 1** (same rules as the left side).
 * Unknown / unchanged tail → `» —`; **maxed lab → current value only** (no `» Max`).
 * **Unlock labs** and **Target Priority** omit `»` (current phrase only).
 * **Spotlight Missiles** at Lv.0 omits `»` (unlock prompt only).
 * Labs with wiki Lv.0→**—** at Lv.0 show first-tier value only (no `— »`).
 */
export function benefitLineWithNextUpgrade(
  item: ResearchItem,
  effectiveLevel: number,
  maxLevelCap: number,
): string {
  if (benefitLineShowsCurrentBenefitOnly(item.name)) {
    return benefitDisplayForCard(item, effectiveLevel, maxLevelCap)
  }
  if (item.name === 'Spotlight Missiles' && effectiveLevel <= 0) {
    return benefitDisplayForCard(item, effectiveLevel, maxLevelCap)
  }
  const current = benefitDisplayForCard(item, effectiveLevel, maxLevelCap)
  if (
    effectiveLevel <= 0 &&
    current === '—' &&
    maxLevelCap > 0 &&
    effectiveLevel < maxLevelCap
  ) {
    const firstTier = nextBenefitDisplayForUpgradeLine(
      item,
      effectiveLevel,
      maxLevelCap,
    )
    if (firstTier !== '—') return firstTier
  }

  if (maxLevelCap <= 0) {
    return `${current} » —`
  }

  if (effectiveLevel >= maxLevelCap) {
    return current
  }

  const nextStr = nextBenefitDisplayForUpgradeLine(
    item,
    effectiveLevel,
    maxLevelCap,
  )

  if (nextStr === current) {
    return `${current} » —`
  }

  return `${current} » ${nextStr}`
}

/**
 * Time for the next upgrade at `effectiveLevel`; from `tables/labs/main/*.json` when available, otherwise
 * `tower-labs.json` `DURATION`, divided by simulated **Labs Speed** (`labsSpeedMultiplier`) on all labs
 * except **Labs Speed** itself.
 *
 * `labsSpeedMultiplier` should be **(Labs Speed research) × (1 + Σ relic lab-speed %)**
 * (multiplicative stacking; see {@link combinedLabsSpeedMultiplier}).
 */
export function researchTimeForNextUpgrade(
  item: ResearchItem,
  effectiveLevel: number,
  maxLevelCap: number,
  labsSpeedMultiplier = 1,
): string {
  if (maxLevelCap > 0 && effectiveLevel >= maxLevelCap) return 'Max'

  const sec = toolkitUpgradeDurationSeconds(item.name, effectiveLevel)
  if (sec != null) {
    let adjusted = sec
    if (
      item.name !== 'Labs Speed' &&
      labsSpeedMultiplier > 1 &&
      Number.isFinite(labsSpeedMultiplier)
    ) {
      adjusted = sec / labsSpeedMultiplier
    }
    return formatResearchDurationSeconds(adjusted)
  }

  return '—'
}

export function levelOverrideKey(sectionIndex: number, itemIndex: number): string {
  return `${sectionIndex}-${itemIndex}`
}

export function getEffectiveLevel(
  sectionIndex: number,
  itemIndex: number,
  item: ResearchItem,
  overrides: Record<string, number>,
): number {
  const key = levelOverrideKey(sectionIndex, itemIndex)
  if (Object.prototype.hasOwnProperty.call(overrides, key)) {
    return overrides[key]!
  }
  return getLevelBounds(item).current
}

/**
 * Labs Coin Discount % implied by the simulated level of that lab (0 if missing).
 * Applies to all coin labs except **Labs Coin Discount** itself (see {@link marginalCostForNextUpgrade}).
 */
export function resolveLabsCoinDiscountPercent(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  for (let si = 0; si < data.sections.length; si++) {
    const items = data.sections[si].items
    for (let ii = 0; ii < items.length; ii++) {
      const item = items[ii]
      if (item.name !== 'Labs Coin Discount') continue
      const bounds = getLevelBounds(item)
      const eff = getEffectiveLevel(si, ii, item, overrides)
      return labsCoinDiscountTotalPercent(eff, bounds.max)
    }
  }
  return 0
}

/** Labs Speed multiplier implied by the simulated level of that lab (**x1** when missing). */
export function resolveLabsSpeedMultiplier(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  for (let si = 0; si < data.sections.length; si++) {
    const items = data.sections[si].items
    for (let ii = 0; ii < items.length; ii++) {
      const item = items[ii]
      if (item.name !== 'Labs Speed') continue
      const bounds = getLevelBounds(item)
      const eff = getEffectiveLevel(si, ii, item, overrides)
      return labsSpeedMultiplierAtLevel(eff, bounds.max)
    }
  }
  return 1
}

/**
 * Simulated Defense **Health** or **Health Regen** lab as a multiplier for workshop **Value**
 * (same curve as the lab card). Returns **1** when the row is missing from `data`.
 */
export function defenseResearchHealthStyleMultiplier(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: 'Health' | 'Health Regen',
): number {
  for (let si = 0; si < data.sections.length; si++) {
    if (data.sections[si].sectionSlug !== 'defense-research') continue
    const items = data.sections[si].items
    for (let ii = 0; ii < items.length; ii++) {
      const item = items[ii]!
      if (item.name !== labName) continue
      const eff = getEffectiveLevel(si, ii, item, overrides)
      const { max } = getLevelBounds(item)
      return healthStyleLabMultiplier(eff, max)
    }
  }
  return 1
}

/**
 * Simulated **Garlic Thorns** lab as additive **%** bonus (same curve as the lab card), for workshop **Thorn Damage** display.
 * Returns **0** when the row is missing from `data`.
 */
export function defenseResearchGarlicThornsLabPercentPoints(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  for (let si = 0; si < data.sections.length; si++) {
    if (data.sections[si].sectionSlug !== 'defense-research') continue
    const items = data.sections[si].items
    for (let ii = 0; ii < items.length; ii++) {
      const item = items[ii]!
      if (item.name !== 'Garlic Thorns') continue
      const eff = getEffectiveLevel(si, ii, item, overrides)
      const { max } = getLevelBounds(item)
      return garlicThornsLabPercentPoints(eff, max)
    }
  }
  return 0
}

/**
 * Simulated **Defense %** lab as additive **%** (percent points) for workshop **Defense %** display.
 * Returns **0** when the row is missing from `data`.
 */
export function defenseResearchDefensePercentLabPercentPoints(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  for (let si = 0; si < data.sections.length; si++) {
    if (data.sections[si].sectionSlug !== 'defense-research') continue
    const items = data.sections[si].items
    for (let ii = 0; ii < items.length; ii++) {
      const item = items[ii]!
      if (item.name !== 'Defense %') continue
      const eff = getEffectiveLevel(si, ii, item, overrides)
      const { max } = getLevelBounds(item)
      return defensePercentLabPercentPoints(eff, max)
    }
  }
  return 0
}

/**
 * Simulated Attack **Damage** lab as a multiplier for workshop **Damage** display (same curve as the lab card).
 * Returns **1** when the row is missing from `data`.
 */
function resolveWorkshopDiscountPercentByLabName(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: string,
): number {
  for (let si = 0; si < data.sections.length; si++) {
    const items = data.sections[si].items
    for (let ii = 0; ii < items.length; ii++) {
      const item = items[ii]!
      if (item.name !== labName) continue
      const eff = getEffectiveLevel(si, ii, item, overrides)
      const { max } = getLevelBounds(item)
      return workshopDiscountTotalPercent(eff, max)
    }
  }
  return 0
}

/** Simulated **Workshop Attack Discount** % (0 when missing). */
export function resolveWorkshopAttackDiscountPercent(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  return resolveWorkshopDiscountPercentByLabName(
    data,
    overrides,
    'Workshop Attack Discount',
  )
}

/** Total **Enhancement Attack - Coin Discount** % at a given lab level. */
export function enhancementAttackDiscountTotalPercent(
  effectiveLevel: number,
  maxLevelCap: number,
): number {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return 0.3 * capped
}

/** Simulated **Enhancement Attack - Coin Discount** % (0 when missing). */
export function resolveEnhancementAttackDiscountPercent(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  return resolveEnhancementCoinDiscountPercentByLabName(
    data,
    overrides,
    'Enhancement Attack - Coin Discount',
  )
}

/** Simulated **Enhancement Defense - Coin Discount** % (0 when missing). */
export function resolveEnhancementDefenseDiscountPercent(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  return resolveEnhancementCoinDiscountPercentByLabName(
    data,
    overrides,
    'Enhancement Defense - Coin Discount',
  )
}

/** Simulated **Enhancement Utility - Coin Discount** % (0 when missing). */
export function resolveEnhancementUtilityDiscountPercent(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  return resolveEnhancementCoinDiscountPercentByLabName(
    data,
    overrides,
    'Enhancement Utility - Coin Discount',
  )
}

function resolveEnhancementCoinDiscountPercentByLabName(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: string,
): number {
  for (let si = 0; si < data.sections.length; si++) {
    const items = data.sections[si].items
    for (let ii = 0; ii < items.length; ii++) {
      const item = items[ii]!
      if (item.name !== labName) continue
      const eff = getEffectiveLevel(si, ii, item, overrides)
      const { max } = getLevelBounds(item)
      return enhancementAttackDiscountTotalPercent(eff, max)
    }
  }
  return 0
}

/** Simulated **Workshop Defense Discount** % (0 when missing). */
export function resolveWorkshopDefenseDiscountPercent(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  return resolveWorkshopDiscountPercentByLabName(
    data,
    overrides,
    'Workshop Defense Discount',
  )
}

/** Simulated **Workshop Utility Discount** % (0 when missing). */
export function resolveWorkshopUtilityDiscountPercent(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  return resolveWorkshopDiscountPercentByLabName(
    data,
    overrides,
    'Workshop Utility Discount',
  )
}

function attackResearchLabMultiplierByName(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: string,
): number {
  for (let si = 0; si < data.sections.length; si++) {
    if (data.sections[si].sectionSlug !== 'attack-research') continue
    const items = data.sections[si].items
    for (let ii = 0; ii < items.length; ii++) {
      const item = items[ii]!
      if (item.name !== labName) continue
      const eff = getEffectiveLevel(si, ii, item, overrides)
      const { max } = getLevelBounds(item)
      return damageStyleLabMultiplier(eff, max)
    }
  }
  return 1
}

export function attackResearchDamageLabMultiplier(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  return attackResearchLabMultiplierByName(data, overrides, 'Damage')
}

/**
 * Share of **Damage / Meter** lab excess in wiki **Displayed damage** **Lab**
 * (calibrated: **×1.28** DPM lab → **×1.226** in the Lab product).
 */
export const WORKSHOP_DISPLAYED_DAMAGE_DPM_LAB_EXCESS_FRACTION = 0.226 / 0.28

/** DPM lab factor for displayed-damage **Lab** (not the ×/m workshop card). */
export function attackResearchDisplayedDamageDpmLabMultiplier(
  damagePerMeterLabMultiplier: number,
): number {
  if (
    !Number.isFinite(damagePerMeterLabMultiplier) ||
    damagePerMeterLabMultiplier <= 1 + 1e-9
  ) {
    return 1
  }
  return (
    1 +
    (damagePerMeterLabMultiplier - 1) * WORKSHOP_DISPLAYED_DAMAGE_DPM_LAB_EXCESS_FRACTION
  )
}

/**
 * Wiki **Displayed damage** **Lab** term: Attack **Damage** × partial **Damage / Meter** ×
 * **Attack Speed** (damage-style +0.02/level curves).
 */
export function attackResearchDisplayedDamageLabMultiplier(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  return (
    attackResearchDamageLabMultiplier(data, overrides) *
    attackResearchDisplayedDamageDpmLabMultiplier(
      attackResearchDamageStyleLabMultiplier(data, overrides, 'Damage / Meter'),
    ) *
    attackResearchAttackSpeedLabMultiplier(data, overrides)
  )
}

/** Simulated Attack **Attack Speed** lab multiplier (same **+0.02/level** curve as Damage). */
export function attackResearchAttackSpeedLabMultiplier(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  return attackResearchLabMultiplierByName(data, overrides, 'Attack Speed')
}

/** Simulated Attack lab using the **Damage-style** multiplier curve (**+0.02/level**). */
export function attackResearchDamageStyleLabMultiplier(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: string,
): number {
  return attackResearchLabMultiplierByName(data, overrides, labName)
}

type LabEffectiveLevel = { effectiveLevel: number; maxLevel: number }

function findLabEffectiveLevel(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: string,
  sectionSlug?: string,
): LabEffectiveLevel | null {
  for (let si = 0; si < data.sections.length; si++) {
    const section = data.sections[si]!
    if (sectionSlug != null && section.sectionSlug !== sectionSlug) continue
    const items = section.items
    for (let ii = 0; ii < items.length; ii++) {
      const item = items[ii]!
      if (item.name !== labName) continue
      const { max } = getLevelBounds(item)
      return {
        effectiveLevel: getEffectiveLevel(si, ii, item, overrides),
        maxLevel: max,
      }
    }
  }
  return null
}

function cappedLabLevel(level: LabEffectiveLevel): number {
  return level.maxLevel > 0
    ? Math.min(Math.max(0, level.effectiveLevel), level.maxLevel)
    : Math.max(0, level.effectiveLevel)
}

function defenseLabLevel(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: string,
): LabEffectiveLevel | null {
  return findLabEffectiveLevel(data, overrides, labName, 'defense-research')
}

function utilityLabLevel(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: string,
): LabEffectiveLevel | null {
  return findLabEffectiveLevel(data, overrides, labName, 'utility-research')
}

function botsLabLevel(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: string,
): LabEffectiveLevel | null {
  return findLabEffectiveLevel(data, overrides, labName, 'bots')
}

/** Bot cooldown labs: **−1s × lab level** (capped). */
export function botsResearchCooldownSecondsReduction(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: string,
): number {
  const level = botsLabLevel(data, overrides, labName)
  if (level == null) return 0
  return cappedLabLevel(level)
}

/** Golden / Amplify / Bot Bot duration labs: **+0.5s × lab level** (capped). */
export function botsResearchDurationBonusSeconds(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: string,
): number {
  const level = botsLabLevel(data, overrides, labName)
  if (level == null) return 0
  return cappedLabLevel(level) / 2
}

/**
 * Thunder Bot - Linger Time lab bonus for workshop **Linger** % display:
 * **+3.00% + 0.5% × lab level** (Lv.0→3 … Lv.20→13; wiki **3.50 … 13.00** at Lv.1…20).
 * Lab cards still show the same curve as seconds (`+3s` … `+13s`).
 */
export function botsResearchThunderLingerLabPercentPoints(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  const level = botsLabLevel(data, overrides, 'Thunder Bot - Linger Time')
  if (level == null) return 0
  return 3 + cappedLabLevel(level) / 2
}

/** **+pctPerLevel × lab level** percent points (Recovery Package, Enemy Level Skip, etc.). */
export function labIncludePercentPoints(
  effectiveLevel: number,
  maxLevelCap: number,
  pctPerLevel: number,
): number {
  const capped =
    maxLevelCap > 0
      ? Math.min(Math.max(0, effectiveLevel), maxLevelCap)
      : Math.max(0, effectiveLevel)
  return pctPerLevel * capped
}

export function utilityResearchDamageStyleLabMultiplier(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: string,
): number {
  const level = utilityLabLevel(data, overrides, labName)
  if (level == null) return 1
  return damageStyleLabMultiplier(level.effectiveLevel, level.maxLevel)
}

export function attackResearchHealthStyleLabMultiplier(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: string,
): number {
  const level = findLabEffectiveLevel(data, overrides, labName, 'attack-research')
  if (level == null) return 1
  return healthStyleLabMultiplier(level.effectiveLevel, level.maxLevel)
}

export function defenseResearchHealthStyleLabMultiplierByName(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: string,
): number {
  const level = defenseLabLevel(data, overrides, labName)
  if (level == null) return 1
  return healthStyleLabMultiplier(level.effectiveLevel, level.maxLevel)
}

export function defenseResearchOrbsSpeedLabPlus(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  const level = defenseLabLevel(data, overrides, 'Orbs Speed')
  if (level == null) return 0
  return 0.1 * cappedLabLevel(level)
}

export function defenseResearchExtraExtraOrbsBonus(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  const level = defenseLabLevel(data, overrides, 'Extra Extra Orbs')
  if (level == null) return 0
  return cappedLabLevel(level)
}

export function defenseResearchShockwaveSizeLabPlus(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  const level = defenseLabLevel(data, overrides, 'Shockwave Size')
  if (level == null) return 0
  return 0.05 * cappedLabLevel(level)
}

export function defenseResearchLandMineDamageLabPercentPoints(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  const level = defenseLabLevel(data, overrides, 'Land Mine Damage')
  if (level == null) return 0
  return 10 * cappedLabLevel(level)
}

export function defenseResearchWallHealthLabPercentPoints(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  const level = defenseLabLevel(data, overrides, 'Wall Health')
  if (level == null) return 0
  return 2 * cappedLabLevel(level)
}

export function defenseResearchWallRebuildLabSecondsReduction(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  const level = defenseLabLevel(data, overrides, 'Wall Rebuild')
  if (level == null) return 0
  return 10 * cappedLabLevel(level)
}

export function attackResearchSuperCritChanceLabPercentPoints(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  const level = findLabEffectiveLevel(data, overrides, 'Super Crit Chance', 'attack-research')
  if (level == null) return 0
  return 0.1 * cappedLabLevel(level)
}

export function utilityResearchIncludePercentLabPoints(
  data: ResearchData,
  overrides: Record<string, number>,
  labName: string,
  pctPerLevel: number,
): number {
  const level = utilityLabLevel(data, overrides, labName)
  if (level == null) return 0
  return labIncludePercentPoints(level.effectiveLevel, level.maxLevel, pctPerLevel)
}

/** **Standard Perks Bonus** lab: level **n** → **n%** bonus (0…0.25 at max 25). */
export function attackResearchStandardPerkBonusFraction(
  data: ResearchData,
  overrides: Record<string, number>,
): number {
  for (let si = 0; si < data.sections.length; si++) {
    if (data.sections[si].sectionSlug !== 'perks-research') continue
    const items = data.sections[si].items
    for (let ii = 0; ii < items.length; ii++) {
      const item = items[ii]!
      if (item.name !== 'Standard Perks Bonus') continue
      const eff = getEffectiveLevel(si, ii, item, overrides)
      const { max } = getLevelBounds(item)
      const capped =
        max > 0 ? Math.min(Math.max(0, eff), max) : Math.max(0, eff)
      return capped / 100
    }
  }
  return 0
}

export interface ResearchSection {
  title: string
  items: ResearchItem[]
  /** Filename stem from manifest path, e.g. `main-research` (for i18n overlays). */
  sectionSlug: string
}

export interface ResearchData {
  sections: ResearchSection[]
}

export interface ResearchManifest {
  sectionFiles: string[]
  /** Bump when research JSON changes so clients and SW can invalidate caches. */
  dataVersion?: string
}

function isResearchState(v: unknown): v is ResearchState {
  return v === 'default' || v === 'max' || v === 'researching'
}

function isResearchItem(v: unknown): v is ResearchItem {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (
    typeof o.name !== 'string' ||
    typeof o.level !== 'string' ||
    typeof o.benefit !== 'string' ||
    typeof o.time !== 'string' ||
    typeof o.cost !== 'string' ||
    !isResearchState(o.state)
  ) {
    return false
  }
  if (o.currentLevel !== undefined && typeof o.currentLevel !== 'number') {
    return false
  }
  if (o.maxLevel !== undefined && typeof o.maxLevel !== 'number') {
    return false
  }
  if (o.coinsToMaxRaw !== undefined && typeof o.coinsToMaxRaw !== 'number') {
    return false
  }
  if (o.costPlusOne !== undefined && typeof o.costPlusOne !== 'string') {
    return false
  }
  if (
    o.stoneUnlockCost !== undefined &&
    (typeof o.stoneUnlockCost !== 'number' ||
      !Number.isFinite(o.stoneUnlockCost) ||
      o.stoneUnlockCost < 0)
  ) {
    return false
  }
  return true
}

function isResearchSection(v: unknown): v is Omit<ResearchSection, 'sectionSlug'> {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (typeof o.title !== 'string' || !Array.isArray(o.items)) return false
  return o.items.every(isResearchItem)
}

export function parseResearchData(raw: unknown): ResearchData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Research data must be a JSON object')
  }
  const o = raw as Record<string, unknown>
  if (!Array.isArray(o.sections)) {
    throw new Error('Missing "sections" array')
  }
  if (!o.sections.every(isResearchSection)) {
    throw new Error(
      'Invalid section or item shape (see public/research/sections/*.json)',
    )
  }
  const rawSections = o.sections as Omit<ResearchSection, 'sectionSlug'>[]
  return {
    sections: rawSections.map((s, i) => ({
      ...s,
      sectionSlug: `section-${i}`,
    })),
  }
}

export function parseResearchManifest(raw: unknown): ResearchManifest {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Research manifest must be a JSON object')
  }
  const o = raw as Record<string, unknown>
  if (!Array.isArray(o.sectionFiles)) {
    throw new Error('Manifest missing "sectionFiles" array')
  }
  if (!o.sectionFiles.every((x) => typeof x === 'string')) {
    throw new Error('Manifest "sectionFiles" must be strings')
  }
  const dataVersion =
    typeof o.dataVersion === 'string' && o.dataVersion.trim().length > 0
      ? o.dataVersion.trim()
      : undefined
  return {
    sectionFiles: o.sectionFiles as string[],
    ...(dataVersion ? { dataVersion } : {}),
  }
}

export function parseResearchSection(
  raw: unknown,
  sectionSlug: string,
): ResearchSection {
  if (!isResearchSection(raw)) {
    throw new Error('Invalid section file (need title + items[])')
  }
  const o = raw as Omit<ResearchSection, 'sectionSlug'>
  const items = o.items.map((item) => {
    const assistModuleLab = isAssistModuleLabName(item.name)
    return {
      ...item,
      cost: normalizeCoinAbbrevDisplay(item.cost, { assistModuleLab }),
      ...(item.costPlusOne != null
        ? {
            costPlusOne: normalizeCoinAbbrevDisplay(item.costPlusOne, {
              assistModuleLab,
            }),
          }
        : {}),
    }
  })
  return { title: o.title, items, sectionSlug }
}
