/**
 * Wire workshop stat value helpers to workshopToolkitStatValue.
 * Run: node scripts/wire-workshop-god-values.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(root, 'src/data')

/** fnName → [godName, optional body suffix e.g. " / 1e6"] */
const FN_TO_GOD = {
  workshopAttackSpeedStatValue: ['Attack Speed'],
  workshopAttackRangeMeters: ['Range', ' / 1e6'],
  workshopCriticalChancePercent: ['Critical Chance'],
  workshopCriticalFactorStatValue: ['Critical Factor'],
  workshopDamageStatAtLevel: ['Damage'],
  workshopDamagePerMeterStatMultiplier: ['Damage - Meter'],
  workshopMultishotChancePercent: ['Multishot Chance'],
  workshopMultishotTargetsCount: ['Multishot Targets'],
  workshopRapidFireChancePercent: ['Rapid Fire Chance'],
  workshopRapidFireDurationSeconds: ['Rapid Fire Duration'],
  workshopBounceShotChancePercent: ['Bounce Shot Chance'],
  workshopBounceShotRangeMeters: ['Bounce Shot Range'],
  workshopBounceShotTargetsCount: ['Bounce Shot Targets'],
  workshopSuperCritChancePercent: ['Super Crit Chance'],
  workshopSuperCritMultValue: ['Super Crit Mult'],
  workshopRendArmorChancePercent: ['Rend Armor Chance'],
  workshopRendArmorMultValue: ['Rend Armor Mult'],
  workshopHealthStatValue: ['Health'],
  workshopHealthRegenStatValue: ['Health Regen'],
  workshopDefensePercentStatPercentPoints: ['Defense Percent'],
  workshopDefenseAbsoluteStatValue: ['Defense Absolute'],
  workshopThornDamageStatPercentPoints: ['Thorns'],
  workshopLifestealStatPercentPoints: ['Lifesteal'],
  workshopKnockbackChanceStatPercentPoints: ['Knockback Chance'],
  workshopKnockbackForceStatMultiplier: ['Knockback Force'],
  workshopOrbSpeedStatMultiplier: ['Orb Speed'],
  workshopOrbsStatCount: ['Orbs'],
  workshopShockwaveSizeStatMultiplier: ['Shockwave Size'],
  workshopShockwaveFrequencyStatSeconds: ['Shockwave Frequency'],
  workshopLandMineChanceStatPercentPoints: ['Land Mine Chance'],
  workshopLandMineDamageStatPercent: ['Land Mine Damage'],
  workshopLandMineRadiusStatValue: ['Land Mine Radius'],
  workshopDeathDefyStatPercent: ['Death Defy'],
  workshopWallHealthStatPercent: ['Wall Health'],
  workshopWallRebuildStatSeconds: ['Wall Rebuild'],
  workshopCashBonusStatMultiplier: ['Cash Bonus'],
  workshopCashPerWaveStatAmount: ['Cash - Wave'],
  workshopCoinsKillBonusStatMultiplier: ['Coins - Kill Bonus'],
  workshopCoinsWaveStatAmount: ['Coins - Wave'],
  workshopFreeAttackUpgradeStatPercentPoints: ['Free Attack Upgrade'],
  workshopFreeDefenseUpgradeStatPercentPoints: ['Free Defense Upgrade'],
  workshopFreeUtilityUpgradeStatPercentPoints: ['Free Utility Upgrade'],
  workshopInterestPerWaveStatPercentPoints: ['Interest - Wave'],
  workshopRecoveryAmountStatPercent: ['Recovery Amount'],
  workshopMaxRecoveryStatMultiplier: ['Max Recovery'],
  workshopPackageChanceStatPercent: ['Package Chance'],
  workshopEnhanceAttackSpeedMultiplier: ['Attack Speed +'],
  workshopEnhanceEnemyLevelSkipMultiplier: ['Enemy Level Skip +'],
  workshopEnhanceFreeUpgradesMultiplier: ['Free Upgrades +'],
  workshopEnhanceOrbSizeMultiplier: ['Orb Size'],
  workshopEnhanceUtilityTier200Multiplier: ['Coin Bonus +'],
}

function ensureImport(text) {
  if (text.includes('workshopToolkitStatValue')) return text
  const line = "import { workshopToolkitStatValue } from '../workshopCosts'\n"
  const m = text.match(/^(\/\*\*[\s\S]*?\*\/\s*\n|\/\/[^\n]*\n)*/)
  if (m) return text.slice(0, m[0].length) + line + text.slice(m[0].length)
  return line + text
}

function patchFn(text, fnName, godName, suffix = '') {
  const re = new RegExp(
    `export function ${fnName}\\([^)]*\\): number \\{[\\s\\S]*?\\n\\}`,
    'm',
  )
  const expr = suffix
    ? `workshopToolkitStatValue('${godName}', completedLevels)!${suffix}`
    : `workshopToolkitStatValue('${godName}', completedLevels)!`
  const replacement = `export function ${fnName}(completedLevels: number): number {
  return ${expr}
}`
  if (!re.test(text)) {
    console.warn(`skip ${fnName}`)
    return text
  }
  return text.replace(re, replacement)
}

for (const file of fs.readdirSync(dataDir).filter((f) => f.startsWith('workshop') && f.endsWith('.ts'))) {
  let text = fs.readFileSync(path.join(dataDir, file), 'utf8')
  let changed = false
  for (const [fnName, [godName, suffix = '']] of Object.entries(FN_TO_GOD)) {
    if (!text.includes(`function ${fnName}`)) continue
    const next = patchFn(text, fnName, godName, suffix)
    if (next !== text) {
      text = next
      changed = true
    }
  }
  if (changed) {
    text = ensureImport(text)
    fs.writeFileSync(path.join(dataDir, file), text)
    console.log('patched', file)
  }
}
