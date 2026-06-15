import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { decodePlayerInfoFile } from './decodePlayerInfo'
import { relicIndicesToOwnedIds } from './mapPlayerDataToTower'
import { workshopRelicIdAtGameIndex } from './gameRelicMapping'

const SAMPLE = 'h:/The Tower/playerInfo.dat'

describe('gameRelicMapping', () => {
  it('maps game enum indices, not wiki catalog order', () => {
    expect(workshopRelicIdAtGameIndex(23)).toBe('1st_tower_birthday')
    expect(workshopRelicIdAtGameIndex(30)).toBe('ionized_plasma')
    expect(workshopRelicIdAtGameIndex(28)).toBe('bacteriophage')
    expect(workshopRelicIdAtGameIndex(274)).toBe('big_party')
    expect(workshopRelicIdAtGameIndex(275)).toBe('celebration')
  })

  it('imports 1st Tower Birthday from sample save, not 3rd–6th', async () => {
    if (!existsSync(SAMPLE)) return
    const save = await decodePlayerInfoFile(new Uint8Array(readFileSync(SAMPLE)))
    const owned = relicIndicesToOwnedIds(save.relicsUnlocked)
    const birthdays = owned.filter((id) => id.includes('tower_birthday'))
    expect(birthdays).toEqual(['1st_tower_birthday'])
    expect(owned).toContain('ionized_plasma')
    expect(owned).not.toContain('3rd_tower_birthday')
    expect(owned).not.toContain('4th_tower_birthday')
    expect(owned).not.toContain('5th_tower_birthday')
    expect(owned).not.toContain('6th_tower_birthday')
  })
})
