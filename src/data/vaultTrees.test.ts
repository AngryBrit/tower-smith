import { describe, expect, it } from 'vitest'
import {
  VAULT_NODES,
  VAULT_NODES_BY_TREE,
  vaultNodeById,
} from './vaultTrees'

describe('vault trees', () => {
  it('has unique node ids', () => {
    const ids = VAULT_NODES.map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every parent reference resolves', () => {
    for (const node of VAULT_NODES) {
      if (node.parentId == null) continue
      expect(vaultNodeById(node.parentId), `parent of ${node.id}`).toBeDefined()
    }
  })

  it('every hub reference resolves on the same row', () => {
    for (const node of VAULT_NODES) {
      if (!node.hubId) continue
      const hub = vaultNodeById(node.hubId)
      expect(hub, `hub of ${node.id}`).toBeDefined()
      expect(hub!.order, `${node.id} hub order`).toBe(node.order)
      expect(hub!.column, `${node.id} hub column`).toBe('middle')
    }
  })

  it('parents live in the same tree at or below the node (a hub branch shares its row)', () => {
    for (const node of VAULT_NODES) {
      const parent = node.parentId ? vaultNodeById(node.parentId) : undefined
      if (!parent) continue
      expect(parent.tree, `${node.id} parent tree`).toBe(node.tree)
      expect(parent.order, `${node.id} parent order`).toBeLessThanOrEqual(node.order)
    }
  })

  it('each tree has exactly one root', () => {
    for (const tree of Object.values(VAULT_NODES_BY_TREE)) {
      const roots = tree.filter((n) => n.parentId == null)
      expect(roots).toHaveLength(1)
      expect(roots[0].order).toBe(0)
    }
  })

  it('cumulative key cost along the parent chain matches the displayed total', () => {
    for (const node of VAULT_NODES) {
      if (node.total == null) continue
      let sum = 0
      let cursor: typeof node | undefined = node
      const seen = new Set<string>()
      while (cursor) {
        if (seen.has(cursor.id)) throw new Error(`cycle at ${cursor.id}`)
        seen.add(cursor.id)
        sum += cursor.keyCost
        cursor = cursor.parentId ? vaultNodeById(cursor.parentId) : undefined
      }
      expect(sum, `${node.id} path-sum`).toBe(node.total)
    }
  })
})
