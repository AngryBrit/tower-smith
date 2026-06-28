/**
 * Vault node icon resolution. Harmony assets live under `public/vault/harmony/`;
 * Power assets will use `public/vault/power/` (or `public/vault/<iconId>.png`).
 *
 * Drop new files in the matching folder and add a mapping here when the filename
 * differs from `<iconId>.webp`. Until mapped, `VaultNodeIcon` shows a text fallback.
 */
const base = import.meta.env.BASE_URL

/** iconId -> path under `public/vault/` */
export const VAULT_ICON_OVERRIDES: Readonly<Record<string, string>> = {
  // Harmony (public/vault/harmony/*.webp)
  'discount-enhancements': 'harmony/enhancementDiscount.webp',
  'discount-rerolls': 'harmony/rerollDiscount.webp',
  'card-slot': 'harmony/bonusCardSlot.webp',
  'free-mission-reroll': 'harmony/rerollMission.webp',
  'nuke-automation': 'harmony/nukeAuto.webp',
  'smart-nuke-automation': 'harmony/nukeAuto.webp',
  'workshop-respec-discount': 'harmony/hammer.webp',
  'workshop-presets': 'harmony/workshopPresets.webp',
  'missile-barrage-automation': 'harmony/missileBarrageAuto.webp',
  'smart-missile-barrage-automation': 'harmony/missileBarrageAuto.webp',
  'bot-presets': 'harmony/botPresets.webp',
  'workshop-orb-adjuster': 'harmony/workshopOrbAdjuster.webp',
  'bot-cooldown-sliders': 'harmony/botRangeSlider.webp',
  'daily-mission-shard': 'harmony/chooseShardType.webp',
  'auto-restart-run': 'harmony/autoRestartRun.webp',
  'auto-charge-berzerker': 'harmony/autoChargeBerzerk.webp',
  'damage-cap-slider': 'harmony/damageSlider.webp',
  'bot-respec-discount': 'harmony/botRepec.webp',
  'ad-gems-2': 'harmony/2xAdGemStack.webp',
  'ad-gems-3': 'harmony/adGemStack3x.webp',
  'ad-gems-5': 'harmony/adGemStack5x.webp',
  'demon-mode-automation': 'harmony/demonModeAuto.webp',
  'smart-demon-mode-automation': 'harmony/demonModeAuto.webp',
  'auto-shatter-modules': 'harmony/autoShatterModule.webp',

  // Power (public/vault/power/*)
  'ultimate-damage': 'power/perk_ultimate.webp',
  'bot-range': 'power/botRange.webp',
  'defense-absolute': 'power/Fortress.webp',
  'damage-meter': 'power/bullseye.webp',
  'critical-chance': 'power/CriticalChance.webp',
  'health-regen': 'power/heartbeat.webp',
  health: 'power/heart.webp',
  damage: 'power/sword.webp',
  'super-crit-chance': 'power/superCritical.webp',
  'super-crit-mult': 'power/superCritMulti.webp',
  'critical-factor': 'power/critFactor.webp',
  'rend-armor-mult': 'power/rendArmor.webp',
  'rend-armor-chance': 'power/rendArmor.webp',
  'rapid-fire-chance': 'power/rapidFire.webp',
  'shockwave-frequency': 'power/shockwave.webp',
  'multishot-chance': 'power/multishot.webp',
  'bounce-shot-chance': 'power/perk_bounceShot.webp',
  'death-defy': 'power/deathDefy.webp',
  orbs: 'power/extra_orb.webp',
  'attack-speed': 'power/speedometer.webp',
  'thorn-damage': 'power/thorns.webp',
  'orb-speed': 'power/orbSpeed.webp',
  'wall-rebuild': 'power/brickWall.webp',
  'defense-percent': 'power/extraDefense.webp',
  cash: 'power/perk_cash.webp',
  'coins-kill': 'power/CoinCard.webp',
  'enemy-attack-skip': 'power/enemyAttackSkip.webp',
  'enemy-health-skip': 'power/enemyHealthSkip.webp',
  'recovery-amount': 'power/recoveryAmount.webp',
  'max-recovery': 'power/recoveryAmount.webp',
  'interest-wave': 'power/perk_interest.webp',
  'cash-wave': 'power/cashPerWave.webp',
  'coins-wave': 'power/coinPerWave.webp',
  'free-attack-upgrade': 'power/freeAttackUpgrade.webp',
  'free-defense-upgrade': 'power/freeDefenseUpgrade.webp',
  'free-utility-upgrade': 'power/freeUtilityUpgrade.webp',
  'knockback-force': 'power/knockback.webp',
  'knockback-chance': 'power/knockback.webp',
  'tier-x2': 'power/tier2.webp',
  'tier-x3': 'power/tier3.webp',
}

export function vaultIconSrc(iconId: string): string {
  const file = VAULT_ICON_OVERRIDES[iconId] ?? `${iconId}.png`
  return `${base}vault/${file}`
}
