import fs from 'fs'
import os from 'os'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  formatWorkshopChassisModuleHeroStatMilli,
  workshopChassisModuleHeroStatCommonMilli,
  workshopChassisModuleHeroStatMilli,
} from './workshopChassisModuleHeroStatAnchors'
import type { WorkshopChassisModuleMergeTier } from './workshopChassisModuleShared'

/** Modules v6.1.2 — Inventory tab main-effect Stat column checkpoints. */
const INVENTORY_CHECKPOINTS: {
  slot: 'cannon' | 'armor' | 'generator' | 'core'
  merge: WorkshopChassisModuleMergeTier | 'common'
  level: number
  expected: string
}[] = [
  { slot: 'cannon', merge: 'star_1', level: 160, expected: 'x8.530' },
  { slot: 'generator', merge: 'star_1', level: 160, expected: 'x1.697' },
  { slot: 'generator', merge: 'star_1', level: 218, expected: 'x2.300' },
  { slot: 'generator', merge: 'star_2', level: 160, expected: 'x1.724' },
  { slot: 'generator', merge: 'star_2', level: 236, expected: 'x2.544' },
  { slot: 'generator', merge: 'star_2', level: 237, expected: 'x2.555' },
  { slot: 'generator', merge: 'star_2', level: 238, expected: 'x2.566' },
  { slot: 'generator', merge: 'star_2', level: 239, expected: 'x2.568' },
  { slot: 'generator', merge: 'star_3', level: 160, expected: 'x1.750' },
  { slot: 'generator', merge: 'star_4', level: 200, expected: 'x2.241' },
  { slot: 'generator', merge: 'star_5', level: 200, expected: 'x2.284' },
  { slot: 'generator', merge: 'star_2', level: 240, expected: 'x2.588' },
  { slot: 'generator', merge: 'star_3', level: 257, expected: 'x2.837' },
  { slot: 'generator', merge: 'star_3', level: 258, expected: 'x2.848' },
  { slot: 'generator', merge: 'star_3', level: 259, expected: 'x2.859' },
  { slot: 'generator', merge: 'star_3', level: 260, expected: 'x2.870' },
  { slot: 'generator', merge: 'star_4', level: 276, expected: 'x3.123' },
  { slot: 'generator', merge: 'star_4', level: 278, expected: 'x3.146' },
  { slot: 'generator', merge: 'star_4', level: 279, expected: 'x3.158' },
  { slot: 'generator', merge: 'star_4', level: 280, expected: 'x3.169' },
  { slot: 'generator', merge: 'star_5', level: 300, expected: 'x3.484' },
  { slot: 'cannon', merge: 'mythic_plus', level: 160, expected: 'x8.190' },
  { slot: 'cannon', merge: 'common', level: 20, expected: 'x1.050' },
  { slot: 'armor', merge: 'mythic_plus', level: 160, expected: 'x8.190' },
  { slot: 'armor', merge: 'legendary', level: 100, expected: 'x2.270' },
  { slot: 'armor', merge: 'common', level: 20, expected: 'x1.050' },
  { slot: 'generator', merge: 'epic', level: 60, expected: 'x1.128' },
  { slot: 'generator', merge: 'mythic_plus', level: 160, expected: 'x1.665' },
  { slot: 'generator', merge: 'common', level: 20, expected: 'x1.030' },
  { slot: 'core', merge: 'mythic_plus', level: 160, expected: 'x11.000' },
  { slot: 'core', merge: 'legendary_plus', level: 120, expected: 'x5.500' },
  { slot: 'core', merge: 'common', level: 20, expected: 'x1.230' },
]

function implStat(
  slot: 'cannon' | 'armor' | 'generator' | 'core',
  merge: WorkshopChassisModuleMergeTier | 'common',
  level: number,
): string {
  const milli =
    merge === 'common'
      ? workshopChassisModuleHeroStatCommonMilli(slot, level)
      : workshopChassisModuleHeroStatMilli(slot, merge, level)
  return `x${formatWorkshopChassisModuleHeroStatMilli(milli)}`
}

/** Inventory Stat column may differ by ≤0.003 from planner rounding. */
function inventoryStatMatches(got: string, expected: string): boolean {
  if (got === expected) return true
  const g = Number(got.slice(1))
  const e = Number(expected.slice(1))
  if (!Number.isFinite(g) || !Number.isFinite(e)) return false
  return Math.abs(g - e) <= 0.003
}

describe('Inventory tab hero stat checkpoints', () => {
  it.each(INVENTORY_CHECKPOINTS)('$slot $merge Lv.$level → $expected', ({ slot, merge, level, expected }) => {
    expect(implStat(slot, merge, level)).toBe(expected)
  })
})

const RARITY_MAP: Record<string, WorkshopChassisModuleMergeTier | 'common' | null> = {
  Common: 'common',
  Rare: 'rare',
  'Rare+': 'rare_plus',
  Epic: 'epic',
  'Epic+': 'epic_plus',
  Legendary: 'legendary',
  'Legendary+': 'legendary_plus',
  Mythic: 'mythic',
  'Mythic+': 'mythic_plus',
  Ancestral: 'ancestral',
  'Ancestral 1*': 'star_1',
  'Ancestral 2*': 'star_2',
  'Ancestral 3*': 'star_3',
  'Ancestral 4*': 'star_4',
  'Ancestral 5*': 'star_5',
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i += 1) {
    const c = line[i]
    if (c === '"') {
      inQ = !inQ
      continue
    }
    if (c === ',' && !inQ) {
      cells.push(cur)
      cur = ''
      continue
    }
    cur += c
  }
  cells.push(cur)
  return cells
}

function parseInventoryCsv(csv: string) {
  const results: {
    slot: 'cannon' | 'armor' | 'generator' | 'core'
    merge: WorkshopChassisModuleMergeTier | 'common'
    level: number
    stat: string
  }[] = []
  let slot: 'cannon' | 'armor' | 'generator' | 'core' | null = null

  for (const line of csv.split(/\r?\n/)) {
    if (!line.trim()) continue
    const cells = parseCsvLine(line)
    const c0 = (cells[0] || '').replace(/[^\x20-\x7E]/g, '').trim()
    const c1 = (cells[1] || '').trim()
    if (c0.includes('CANNON') || c1 === 'Tower Damage') slot = 'cannon'
    else if (c0.includes('ARMOR') || c1 === 'Tower Health') slot = 'armor'
    else if (c0.includes('GENERATOR') || c1 === 'Coin Bonus') slot = 'generator'
    else if (c0.includes('CORE') || c1 === 'UW Damage') slot = 'core'

    for (let i = 0; i < cells.length - 2; i += 1) {
      const merge = RARITY_MAP[cells[i]?.trim() ?? '']
      const level = Number(cells[i + 1]?.trim())
      const stat = cells[i + 2]?.trim() ?? ''
      if (!slot || !merge || !Number.isFinite(level) || !/^x[\d.]+$/i.test(stat)) continue
      if (level === 0 && stat === 'x1.000') continue
      results.push({ slot, merge, level, stat })
    }
  }

  const seen = new Set<string>()
  return results.filter((r) => {
    const k = `${r.slot}|${r.merge}|${r.level}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

describe('Inventory tab (live CSV parse)', () => {
  it('matches every parsed Inventory stat row', () => {
    const csvPath = path.join(os.tmpdir(), 'inventory.csv')
    let csv: string
    try {
      csv = fs.readFileSync(csvPath, 'utf8')
    } catch {
      console.warn('Skip live Inventory CSV — run curl first or use hardcoded checkpoints above')
      return
    }

    const rows = parseInventoryCsv(csv)
    expect(rows.length).toBeGreaterThan(0)

    const mismatches: string[] = []
    for (const row of rows) {
      const got = implStat(row.slot, row.merge, row.level)
      if (!inventoryStatMatches(got, row.stat)) {
        mismatches.push(`${row.slot} ${row.merge} L${row.level}: sheet=${row.stat} impl=${got}`)
      }
    }

    expect(mismatches, mismatches.join('\n')).toEqual([])
  })
})
