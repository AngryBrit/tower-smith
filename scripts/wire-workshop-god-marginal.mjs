/**
 * One-off: wire *NextMarginalCoins in src/data/workshop*.ts to workshopToolkitMarginalCoins.
 * Run: node scripts/wire-workshop-god-marginal.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(root, 'src/data')

/** fnName → GOD table display name */
const FN_TO_GOD = {
  workshopAttackSpeedNextMarginalCoins: 'Attack Speed',
  workshopAttackRangeNextMarginalCoins: 'Range',
  workshopCriticalChanceNextMarginalCoins: 'Critical Chance',
  workshopCriticalFactorNextMarginalCoins: 'Critical Factor',
  workshopDamageNextMarginalCoins: 'Damage',
  workshopDamagePerMeterNextMarginalCoins: 'Damage - Meter',
  workshopMultishotChanceNextMarginalCoins: 'Multishot Chance',
  workshopMultishotTargetsNextMarginalCoins: 'Multishot Targets',
  workshopRapidFireChanceNextMarginalCoins: 'Rapid Fire Chance',
  workshopRapidFireDurationNextMarginalCoins: 'Rapid Fire Duration',
  workshopBounceShotChanceNextMarginalCoins: 'Bounce Shot Chance',
  workshopBounceShotRangeNextMarginalCoins: 'Bounce Shot Range',
  workshopBounceShotTargetsNextMarginalCoins: 'Bounce Shot Targets',
  workshopSuperCritChanceNextMarginalCoins: 'Super Crit Chance',
  workshopSuperCritMultNextMarginalCoins: 'Super Crit Mult',
  workshopRendArmorChanceNextMarginalCoins: 'Rend Armor Chance',
  workshopRendArmorMultNextMarginalCoins: 'Rend Armor Mult',
  workshopHealthNextMarginalCoins: 'Health',
  workshopHealthRegenNextMarginalCoins: 'Health Regen',
  workshopDefensePercentNextMarginalCoins: 'Defense Percent',
  workshopDefenseAbsoluteNextMarginalCoins: 'Defense Absolute',
  workshopThornDamageNextMarginalCoins: 'Thorns',
  workshopLifestealNextMarginalCoins: 'Lifesteal',
  workshopKnockbackChanceNextMarginalCoins: 'Knockback Chance',
  workshopKnockbackForceNextMarginalCoins: 'Knockback Force',
  workshopOrbSpeedNextMarginalCoins: 'Orb Speed',
  workshopOrbsNextMarginalCoins: 'Orbs',
  workshopShockwaveSizeNextMarginalCoins: 'Shockwave Size',
  workshopShockwaveFrequencyNextMarginalCoins: 'Shockwave Frequency',
  workshopLandMineChanceNextMarginalCoins: 'Land Mine Chance',
  workshopLandMineDamageNextMarginalCoins: 'Land Mine Damage',
  workshopLandMineRadiusNextMarginalCoins: 'Land Mine Radius',
  workshopDeathDefyNextMarginalCoins: 'Death Defy',
  workshopWallHealthNextMarginalCoins: 'Wall Health',
  workshopWallRebuildNextMarginalCoins: 'Wall Rebuild',
  workshopCashBonusNextMarginalCoins: 'Cash Bonus',
  workshopCashPerWaveNextMarginalCoins: 'Cash - Wave',
  workshopCoinsKillBonusNextMarginalCoins: 'Coins - Kill Bonus',
  workshopCoinsWaveNextMarginalCoins: 'Coins - Wave',
  workshopFreeAttackUpgradeNextMarginalCoins: 'Free Attack Upgrade',
  workshopFreeDefenseUpgradeNextMarginalCoins: 'Free Defense Upgrade',
  workshopFreeUtilityUpgradeNextMarginalCoins: 'Free Utility Upgrade',
  workshopInterestPerWaveNextMarginalCoins: 'Interest - Wave',
  workshopRecoveryAmountNextMarginalCoins: 'Recovery Amount',
  workshopMaxRecoveryNextMarginalCoins: 'Max Recovery',
  workshopPackageChanceNextMarginalCoins: 'Package Chance',
  workshopEnemyAttackLevelSkipNextMarginalCoins: 'Enemy Attack Level Skip',
  workshopEnemyHealthLevelSkipNextMarginalCoins: 'Enemy Health Level Skip',
  workshopEnhanceEnemyLevelSkipNextMarginalCoins: 'Enemy Level Skip +',
  workshopEnhanceOrbSizeNextMarginalCoins: 'Orb Size',
  workshopEnhanceFreeUpgradesNextMarginalCoins: 'Free Upgrades +',
  workshopEnhanceUtilityTier200NextMarginalCoins: null,
  workshopEnhanceTier400NextMarginalCoins: null,
}

function ensureImport(text) {
  if (text.includes("from '../workshopCosts'")) return text
  const importLine = "import { workshopToolkitMarginalCoins } from '../workshopCosts'\n"
  const m = text.match(/^(\/\*\*[\s\S]*?\*\/\s*\n|\/\/[^\n]*\n)*/)
  if (m) {
    return text.slice(0, m[0].length) + importLine + text.slice(m[0].length)
  }
  return importLine + text
}

function patchFn(text, fnName, godName) {
  const re = new RegExp(
    `export function ${fnName}\\([^)]*\\): number \\| undefined \\{[\\s\\S]*?\\n\\}`,
    'm',
  )
  const replacement = `export function ${fnName}(completedLevels: number): number | undefined {
  return workshopToolkitMarginalCoins('${godName}', completedLevels)
}`
  if (!re.test(text)) {
    console.warn(`skip ${fnName}: pattern not found`)
    return text
  }
  return text.replace(re, replacement)
}

for (const file of fs.readdirSync(dataDir).filter((f) => f.startsWith('workshop') && f.endsWith('.ts'))) {
  const filePath = path.join(dataDir, file)
  let text = fs.readFileSync(filePath, 'utf8')
  let changed = false
  for (const [fnName, godName] of Object.entries(FN_TO_GOD)) {
    if (!godName || !text.includes(`function ${fnName}`)) continue
    const next = patchFn(text, fnName, godName)
    if (next !== text) {
      text = next
      changed = true
    }
  }
  if (changed) {
    text = ensureImport(text)
    fs.writeFileSync(filePath, text)
    console.log('patched', file)
  }
}
