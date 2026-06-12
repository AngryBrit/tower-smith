import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  bumpGuardianAllyUpgradeLevel,
  bumpGuardianAttackUpgradeLevel,
  bumpGuardianBountyUpgradeLevel,
  bumpGuardianFetchUpgradeLevel,
  bumpGuardianScoutUpgradeLevel,
  bumpGuardianSummonUpgradeLevel,
  DEFAULT_GUARDIAN_UNLOCKED_SLOTS,
  GUARDIAN_CHIP_STORAGE_KEY,
  isGuardianChipSlotLocked,
  readGuardianChipState,
  respecGuardianChips,
  setGuardianAllyUpgradeLevel,
  setGuardianAttackUpgradeLevel,
  setGuardianBountyUpgradeLevel,
  setGuardianFetchUpgradeLevel,
  setGuardianScoutUpgradeLevel,
  setGuardianSummonUpgradeLevel,
  unlockGuardianChipSlot,
} from './guardianChipStorage'

function createLocalStorageMock(): Storage {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key: string) {
      return store.get(key) ?? null
    },
    key(index: number) {
      return [...store.keys()][index] ?? null
    },
    removeItem(key: string) {
      store.delete(key)
    },
    setItem(key: string, value: string) {
      store.set(key, value)
    },
  }
}

describe('guardianChipStorage upgrades', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('migrates v1 saves so slot 2 requires purchase', () => {
    vi.stubGlobal('localStorage', createLocalStorageMock())
    localStorage.setItem(
      GUARDIAN_CHIP_STORAGE_KEY,
      JSON.stringify({
        unlockedSlots: [true, true, false, false],
        slots: ['fetch', 'summon', null, null],
        unlockedChipIds: ['attack', 'ally', 'bounty', 'fetch', 'summon', 'scout'],
        upgrades: readGuardianChipState().upgrades,
      }),
    )

    const state = readGuardianChipState()

    expect(state.unlockedSlots).toEqual([...DEFAULT_GUARDIAN_UNLOCKED_SLOTS])
    expect(state.slots).toEqual(['fetch', null, null, null])
    expect(isGuardianChipSlotLocked(state, 1)).toBe(true)
    expect(JSON.parse(localStorage.getItem(GUARDIAN_CHIP_STORAGE_KEY)!).storageVersion).toBe(2)
  })

  it('defaults slot 0 unlocked and slots 1–3 locked', () => {
    const state = readGuardianChipState()
    expect(state.unlockedSlots).toEqual([...DEFAULT_GUARDIAN_UNLOCKED_SLOTS])
    expect(isGuardianChipSlotLocked(state, 0)).toBe(false)
    expect(isGuardianChipSlotLocked(state, 1)).toBe(true)
    expect(isGuardianChipSlotLocked(state, 2)).toBe(true)
    expect(isGuardianChipSlotLocked(state, 3)).toBe(true)
    expect(state.slots).toEqual(['fetch', null, null, null])
  })

  it('respec clears loadout and purchased slot unlocks', () => {
    const loaded = unlockGuardianChipSlot(
      unlockGuardianChipSlot(readGuardianChipState(), 1),
      2,
    )
    const respecced = respecGuardianChips({
      ...loaded,
      slots: ['attack', 'ally', 'bounty', null],
    })
    expect(respecced.slots).toEqual([null, null, null, null])
    expect(respecced.unlockedSlots).toEqual([...DEFAULT_GUARDIAN_UNLOCKED_SLOTS])
    expect(isGuardianChipSlotLocked(respecced, 1)).toBe(true)
    expect(isGuardianChipSlotLocked(respecced, 2)).toBe(true)
    expect(isGuardianChipSlotLocked(respecced, 3)).toBe(true)
  })

  it('unlocks purchasable chip slots', () => {
    const base = readGuardianChipState()
    const unlocked = unlockGuardianChipSlot(unlockGuardianChipSlot(base, 1), 2)
    expect(unlocked.unlockedSlots).toEqual([true, true, true, false])
    expect(isGuardianChipSlotLocked(unlocked, 2)).toBe(false)
    expect(isGuardianChipSlotLocked(unlocked, 3)).toBe(true)
    expect(unlockGuardianChipSlot(unlocked, 3)).toBe(unlocked)
  })

  it('defaults all chip upgrades to level 1 on each track', () => {
    const state = readGuardianChipState()
    expect(state.upgrades.attack).toEqual({
      percent: 1,
      cooldown: 1,
      targets: 1,
    })
    expect(state.upgrades.ally).toEqual({
      recovery: 1,
      maxRecovery: 1,
      cooldown: 1,
    })
    expect(state.upgrades.bounty).toEqual({
      multiplier: 1,
      cooldown: 1,
      targets: 1,
    })
    expect(state.upgrades.fetch).toEqual({
      cooldown: 1,
      findChance: 1,
      doubleFindChance: 1,
    })
    expect(state.upgrades.summon).toEqual({
      cooldown: 1,
      duration: 1,
      cashBonus: 1,
    })
    expect(state.upgrades.scout).toEqual({
      cooldown: 1,
      rangeBonus: 1,
      duration: 1,
    })
  })

  it('clamps attack upgrade levels to GOD table bounds', () => {
    const base = readGuardianChipState()
    const maxed = setGuardianAttackUpgradeLevel(
      setGuardianAttackUpgradeLevel(
        setGuardianAttackUpgradeLevel(base, 'percent', 99),
        'cooldown',
        200,
      ),
      'targets',
      0,
    )
    expect(maxed.upgrades.attack).toEqual({
      percent: 20,
      cooldown: 91,
      targets: 1,
    })
  })

  it('bumps attack upgrade levels', () => {
    const next = bumpGuardianAttackUpgradeLevel(readGuardianChipState(), 'percent', 1)
    expect(next.upgrades.attack.percent).toBe(2)
  })

  it('clamps ally upgrade levels to GOD table bounds', () => {
    const base = readGuardianChipState()
    const maxed = setGuardianAllyUpgradeLevel(
      setGuardianAllyUpgradeLevel(
        setGuardianAllyUpgradeLevel(base, 'recovery', 99),
        'maxRecovery',
        200,
      ),
      'cooldown',
      0,
    )
    expect(maxed.upgrades.ally).toEqual({
      recovery: 50,
      maxRecovery: 90,
      cooldown: 1,
    })
  })

  it('bumps ally upgrade levels', () => {
    const next = bumpGuardianAllyUpgradeLevel(readGuardianChipState(), 'recovery', 1)
    expect(next.upgrades.ally.recovery).toBe(2)
  })

  it('clamps bounty upgrade levels to GOD table bounds', () => {
    const base = readGuardianChipState()
    const maxed = setGuardianBountyUpgradeLevel(
      setGuardianBountyUpgradeLevel(
        setGuardianBountyUpgradeLevel(base, 'multiplier', 200),
        'cooldown',
        99,
      ),
      'targets',
      0,
    )
    expect(maxed.upgrades.bounty).toEqual({
      multiplier: 100,
      cooldown: 61,
      targets: 1,
    })
  })

  it('bumps bounty upgrade levels', () => {
    const next = bumpGuardianBountyUpgradeLevel(readGuardianChipState(), 'multiplier', 1)
    expect(next.upgrades.bounty.multiplier).toBe(2)
  })

  it('clamps fetch upgrade levels to GOD table bounds', () => {
    const base = readGuardianChipState()
    const maxed = setGuardianFetchUpgradeLevel(
      setGuardianFetchUpgradeLevel(
        setGuardianFetchUpgradeLevel(base, 'cooldown', 99),
        'findChance',
        200,
      ),
      'doubleFindChance',
      0,
    )
    expect(maxed.upgrades.fetch).toEqual({
      cooldown: 61,
      findChance: 41,
      doubleFindChance: 1,
    })
  })

  it('bumps fetch upgrade levels', () => {
    const next = bumpGuardianFetchUpgradeLevel(readGuardianChipState(), 'findChance', 1)
    expect(next.upgrades.fetch.findChance).toBe(2)
  })

  it('clamps summon upgrade levels to GOD table bounds', () => {
    const base = readGuardianChipState()
    const maxed = setGuardianSummonUpgradeLevel(
      setGuardianSummonUpgradeLevel(
        setGuardianSummonUpgradeLevel(base, 'cooldown', 99),
        'duration',
        200,
      ),
      'cashBonus',
      0,
    )
    expect(maxed.upgrades.summon).toEqual({
      cooldown: 71,
      duration: 31,
      cashBonus: 1,
    })
  })

  it('bumps summon upgrade levels', () => {
    const next = bumpGuardianSummonUpgradeLevel(readGuardianChipState(), 'duration', 1)
    expect(next.upgrades.summon.duration).toBe(2)
  })

  it('clamps scout upgrade levels to GOD table bounds', () => {
    const base = readGuardianChipState()
    const maxed = setGuardianScoutUpgradeLevel(
      setGuardianScoutUpgradeLevel(
        setGuardianScoutUpgradeLevel(base, 'cooldown', 99),
        'rangeBonus',
        200,
      ),
      'duration',
      0,
    )
    expect(maxed.upgrades.scout).toEqual({
      cooldown: 71,
      rangeBonus: 41,
      duration: 1,
    })
  })

  it('bumps scout upgrade levels', () => {
    const next = bumpGuardianScoutUpgradeLevel(readGuardianChipState(), 'rangeBonus', 1)
    expect(next.upgrades.scout.rangeBonus).toBe(2)
  })
})
