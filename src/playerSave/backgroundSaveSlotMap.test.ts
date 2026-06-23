import { describe, expect, it } from 'vitest'
import { gameThemeIdAtIndex } from './gameThemeIndex'

/** Owned chain after Clock Tower in save (Mech @ 36; Pi @ 34 may be unowned). */
const POST_CLOCK_TOWER_SAVE_ORDER = [
  'bg-guild-mech-world',
  'bg-camping',
  'bg-cthulhu',
  'bg-koi-pond',
  'bg-guild-party',
  'bg-guild-pixel-alien-war',
  'bg-cyberpunk',
  'bg-crystal-cave',
  'bg-amusement-park',
  'bg-guild-crimson-horror',
  'bg-guild-cozy-cosmos',
  'bg-valentine',
  'bg-glitch',
  'bg-guild-supernova',
  'bg-guild-claw-machine',
  'bg-neuron',
  'bg-guild-magician',
  'bg-5th-anniversary',
  'bg-meteor-shower',
] as const

describe('backgroundSaveSlotMap', () => {
  it('maps Pi @ 34, gap @ 35, Mech World @ 36 (save order ≠ release date)', () => {
    expect(gameThemeIdAtIndex('background', 34)).toBe('bg-pi-disk')
    expect(gameThemeIdAtIndex('background', 35)).toBeUndefined()
    expect(gameThemeIdAtIndex('background', 36)).toBe('bg-guild-mech-world')
  })

  it('maps owned post–Clock Tower chain at save indices 36–54', () => {
    POST_CLOCK_TOWER_SAVE_ORDER.forEach((id, offset) => {
      expect(gameThemeIdAtIndex('background', 36 + offset)).toBe(id)
    })
  })
})
