import { gameSubmoduleImportFromEffectIndices } from '../src/playerSave/gameModuleEffectIndex.ts'

const target = {
  s0: { effectId: 'cash-bonus', rarity: 'common' },
  s1: { effectId: 'enemy-health-level-skip', rarity: 'ancestral' },
  s2: { effectId: 'package-chance', rarity: 'ancestral' },
  s3: { effectId: 'enemy-attack-level-skip', rarity: 'mythic' },
}
const buggy = {
  s0: { effectId: 'cash-bonus', rarity: 'common' },
  s1: { effectId: 'enemy-health-level-skip', rarity: 'ancestral' },
  s2: { effectId: 'package-chance', rarity: 'ancestral' },
  s3: { effectId: 'package-chance', rarity: 'ancestral' },
}

function match(imp, t) {
  for (let i = 0; i < 4; i++) {
    const k = `s${i}`
    if (imp.ordered[i]?.effectId !== t[k].effectId || imp.ordered[i]?.rarity !== t[k].rarity) {
      return false
    }
  }
  return true
}

const merges = ['epic', 'epic_plus', 'legendary', 'mythic', 'ancestral', 'star_1', 'star_2', 'star_3']
for (let a = 154; a <= 158; a++) {
  for (let b = 216; b <= 220; b++) {
    for (let c = 208; c <= 212; c++) {
      for (let d = 208; d <= 215; d++) {
        for (const merge of merges) {
          for (const level of [60, 100, 134, 180]) {
            const imp = gameSubmoduleImportFromEffectIndices(
              'generator',
              [a, b, c, d, 0, 0, 0, 0],
              level,
              0,
              merge,
            )
            if (match(imp, buggy)) console.log('BUGGY', { a, b, c, d, merge, level })
            if (match(imp, target)) console.log('TARGET', { a, b, c, d, merge, level })
          }
        }
      }
    }
  }
}
