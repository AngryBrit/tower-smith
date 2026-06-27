import { useCallback, useEffect, useState } from 'react'
import {
  VAULT_NODES,
  VAULT_TIER3_REQ_T1,
  VAULT_TIER3_REQ_T2,
  VAULT_TIER2_REQ_T1,
  vaultKeyCostForTier,
  vaultMaxTier,
  vaultNodeById,
  type VaultNode,
  type VaultTierGate,
  type VaultTreeId,
} from './data/vaultTrees'

export const VAULT_STORAGE_KEY = 'tower-export-vault-v1'
const CHANGE_EVENT = 'tower-export-vault-change'

export type VaultState = {
  /** Power node id -> owned tier (1..3). Absent/0 means not owned. */
  power: Record<string, number>
  /** Harmony node id -> owned. */
  harmony: Record<string, boolean>
}

function defaultVaultState(): VaultState {
  return { power: {}, harmony: {} }
}

// Children index for cascade removal.
const CHILDREN = new Map<string, string[]>()
for (const node of VAULT_NODES) {
  if (!node.parentId) continue
  const list = CHILDREN.get(node.parentId) ?? []
  list.push(node.id)
  CHILDREN.set(node.parentId, list)
}

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

export function ownedTierOf(state: VaultState, node: VaultNode): number {
  if (node.tree === 'harmony') return state.harmony[node.id] ? 1 : 0
  return state.power[node.id] ?? 0
}

export function isNodeOwned(state: VaultState, node: VaultNode): boolean {
  return ownedTierOf(state, node) >= 1
}

export function isTierUnlocked(state: VaultState, gate: VaultTierGate): boolean {
  const id = gate === 't2' ? 'p-tier2' : 'p-tier3'
  return (state.power[id] ?? 0) >= 1
}

export function countPowerUnlocksAtTier(state: VaultState, minTier: number): number {
  let count = 0
  for (const node of VAULT_NODES) {
    if (node.tree !== 'power' || node.kind !== 'upgrade') continue
    if ((state.power[node.id] ?? 0) >= minTier) count += 1
  }
  return count
}

/** Cumulative keys spent on a node owned up to `tier`. */
export function vaultKeysSpentForNode(node: VaultNode, tier: number): number {
  let sum = 0
  for (let t = 1; t <= tier; t += 1) sum += vaultKeyCostForTier(node, t as 1 | 2 | 3)
  return sum
}

export function totalKeysSpent(state: VaultState, tree?: VaultTreeId): number {
  let sum = 0
  for (const node of VAULT_NODES) {
    if (tree && node.tree !== tree) continue
    sum += vaultKeysSpentForNode(node, ownedTierOf(state, node))
  }
  return sum
}

// ---------------------------------------------------------------------------
// Mutators (pure; return new state)
// ---------------------------------------------------------------------------

function clearDescendants(state: VaultState, nodeId: string): VaultState {
  let power = state.power
  let harmony = state.harmony
  const stack = [...(CHILDREN.get(nodeId) ?? [])]
  while (stack.length) {
    const id = stack.pop()!
    const node = vaultNodeById(id)
    if (!node) continue
    if (node.tree === 'power' && (power[id] ?? 0) > 0) {
      power = { ...power }
      delete power[id]
    } else if (node.tree === 'harmony' && harmony[id]) {
      harmony = { ...harmony }
      delete harmony[id]
    }
    for (const child of CHILDREN.get(id) ?? []) stack.push(child)
  }
  return power === state.power && harmony === state.harmony ? state : { power, harmony }
}

/** Clamp every power node to at most `maxTier` (used when a tier unlock is removed). */
function clampPowerTiers(state: VaultState, maxTier: number): VaultState {
  let changed = false
  const power = { ...state.power }
  for (const node of VAULT_NODES) {
    if (node.tree !== 'power') continue
    const current = power[node.id] ?? 0
    if (current > maxTier) {
      changed = true
      if (maxTier <= 0) delete power[node.id]
      else power[node.id] = maxTier
    }
  }
  return changed ? { ...state, power } : state
}

export function canOwnTier(state: VaultState, node: VaultNode, tier: number): boolean {
  if (tier <= 0) return true
  if (tier > vaultMaxTier(node)) return false
  const parent = node.parentId ? vaultNodeById(node.parentId) : undefined
  if (parent && !isNodeOwned(state, parent)) return false
  if (node.kind === 'tierUnlock') {
    if (node.tierGate === 't2') return countPowerUnlocksAtTier(state, 1) >= VAULT_TIER2_REQ_T1
    if (node.tierGate === 't3') {
      return (
        countPowerUnlocksAtTier(state, 1) >= VAULT_TIER3_REQ_T1 &&
        countPowerUnlocksAtTier(state, 2) >= VAULT_TIER3_REQ_T2
      )
    }
  }
  if (tier >= 2 && !isTierUnlocked(state, 't2')) return false
  if (tier >= 3 && !isTierUnlocked(state, 't3')) return false
  return true
}

export function setPowerNodeTier(state: VaultState, nodeId: string, tier: number): VaultState {
  const node = vaultNodeById(nodeId)
  if (!node || node.tree !== 'power') return state
  const target = Math.max(0, Math.min(tier, vaultMaxTier(node)))
  const current = state.power[nodeId] ?? 0
  if (target === current) return state
  if (target > current && !canOwnTier(state, node, target)) return state

  let next: VaultState
  if (target <= 0) {
    const power = { ...state.power }
    delete power[nodeId]
    next = { ...state, power }
  } else {
    next = { ...state, power: { ...state.power, [nodeId]: target } }
  }

  if (target <= 0) {
    next = clearDescendants(next, nodeId)
    if (node.kind === 'tierUnlock' && node.tierGate === 't2') next = clampPowerTiers(next, 1)
    if (node.kind === 'tierUnlock' && node.tierGate === 't3') next = clampPowerTiers(next, 2)
  }
  return next
}

export function toggleHarmonyNode(state: VaultState, nodeId: string): VaultState {
  const node = vaultNodeById(nodeId)
  if (!node || node.tree !== 'harmony') return state
  if (state.harmony[nodeId]) {
    const harmony = { ...state.harmony }
    delete harmony[nodeId]
    return clearDescendants({ ...state, harmony }, nodeId)
  }
  if (!canOwnTier(state, node, 1)) return state
  return { ...state, harmony: { ...state.harmony, [nodeId]: true } }
}

export function respecVault(state: VaultState, tree?: VaultTreeId): VaultState {
  if (!tree) return defaultVaultState()
  return tree === 'power' ? { ...state, power: {} } : { ...state, harmony: {} }
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

function parseRecordOfNumbers(raw: unknown): Record<string, number> {
  if (typeof raw !== 'object' || raw === null) return {}
  const out: Record<string, number> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const node = vaultNodeById(key)
    if (!node || node.tree !== 'power') continue
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    const tier = Math.max(0, Math.min(Math.floor(value), vaultMaxTier(node)))
    if (tier > 0) out[key] = tier
  }
  return out
}

function parseRecordOfBooleans(raw: unknown): Record<string, boolean> {
  if (typeof raw !== 'object' || raw === null) return {}
  const out: Record<string, boolean> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const node = vaultNodeById(key)
    if (!node || node.tree !== 'harmony') continue
    if (value === true) out[key] = true
  }
  return out
}

export function sanitizeVaultState(raw: unknown): VaultState {
  if (typeof raw !== 'object' || raw === null) return defaultVaultState()
  const record = raw as Record<string, unknown>
  return {
    power: parseRecordOfNumbers(record.power),
    harmony: parseRecordOfBooleans(record.harmony),
  }
}

export function readVaultState(): VaultState {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY)
    if (!raw) return defaultVaultState()
    return sanitizeVaultState(JSON.parse(raw))
  } catch {
    return defaultVaultState()
  }
}

export function writeVaultState(next: VaultState): void {
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore quota / private mode */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

export function useVaultState(): [
  VaultState,
  (updater: (prev: VaultState) => VaultState) => void,
] {
  const [state, setState] = useState<VaultState>(readVaultState)

  useEffect(() => {
    const sync = () => setState(readVaultState())
    window.addEventListener(CHANGE_EVENT, sync)
    const onStorage = (e: StorageEvent) => {
      if (e.key === VAULT_STORAGE_KEY || e.key === null) sync()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const update = useCallback((updater: (prev: VaultState) => VaultState) => {
    setState((prev) => {
      const next = updater(prev)
      writeVaultState(next)
      return next
    })
  }, [])

  return [state, update]
}
