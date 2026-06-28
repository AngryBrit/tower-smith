import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../i18n'
import type { StringId } from '../i18n/dictionary'
import {
  VAULT_MAX_ORDER,
  VAULT_NODES_BY_TREE,
  VAULT_TIER2_REQ_T1,
  VAULT_TIER3_REQ_T1,
  VAULT_TIER3_REQ_T2,
  vaultKeyCostForTier,
  vaultMaxTier,
  vaultNodeById,
  vaultParentOf,
  type VaultNode,
  type VaultTreeId,
} from '../data/vaultTrees'
import {
  canOwnTier,
  countPowerUnlocksAtTier,
  isNodeOwned,
  isTierUnlocked,
  ownedTierOf,
  respecVault,
  setPowerNodeTier,
  toggleHarmonyNode,
  useVaultState,
  type VaultState,
} from '../vaultStorage'
import { VaultNodeIcon } from './VaultNodeIcon'

type VaultPageProps = {
  embeddedInPanel?: boolean
  toolbarMount?: HTMLDivElement | null
}

const COLUMN_INDEX: Record<VaultNode['column'], number> = { left: 1, middle: 2, right: 3 }

const VAULT_KEY_ICON_SRC = `${import.meta.env.BASE_URL}icons/vault_key.webp`

function VaultKeyGlyph({ className }: { className?: string }) {
  return (
    <img
      src={VAULT_KEY_ICON_SRC}
      className={className ? `vault-key-glyph ${className}` : 'vault-key-glyph'}
      alt=""
      aria-hidden
      draggable={false}
    />
  )
}

type Segment = {
  key: string
  cx: number
  cy: number
  px: number
  py: number
  /** When true, draw a straight horizontal line (hub row). */
  horizontal?: boolean
  owned: boolean
}

export function VaultPage({ embeddedInPanel = false, toolbarMount = null }: VaultPageProps) {
  const { t } = useI18n()
  const [state, updateState] = useVaultState()
  const [activeTree, setActiveTree] = useState<VaultTreeId>('harmony')
  const [selectedId, setSelectedId] = useState<string>('h-m1')
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [segments, setSegments] = useState<Segment[]>([])
  const [treeSize, setTreeSize] = useState({ w: 0, h: 0 })

  const viewportRef = useRef<HTMLDivElement>(null)
  const treeRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef(new Map<string, HTMLButtonElement | null>())

  const nodes = VAULT_NODES_BY_TREE[activeTree]
  const maxOrder = VAULT_MAX_ORDER[activeTree]
  const selected = vaultNodeById(selectedId)

  const switchTree = useCallback((tree: VaultTreeId) => {
    setActiveTree(tree)
    setSelectedId(tree === 'power' ? 'p-m1' : 'h-m1')
  }, [])

  // Measure connector segments after layout / on resize.
  useLayoutEffect(() => {
    const tree = treeRef.current
    if (!tree) return
    const compute = () => {
      const base = tree.getBoundingClientRect()
      // Measure the tile, not the button (the button also wraps the cost label
      // below the tile, which would push connector centers downward).
      const tileCenter = (id: string) => {
        const el = nodeRefs.current.get(id)
        const tile = el?.querySelector<HTMLElement>('.vault-node__tile')
        const rect = (tile ?? el)?.getBoundingClientRect()
        if (!rect) return null
        return {
          x: rect.left - base.left + rect.width / 2,
          y: rect.top - base.top + rect.height / 2,
        }
      }
      const segs: Segment[] = []
      for (const node of nodes) {
        if (node.parentId) {
          const c = tileCenter(node.id)
          const p = tileCenter(node.parentId)
          if (c && p) {
            segs.push({
              key: `${node.id}->${node.parentId}`,
              cx: c.x,
              cy: c.y,
              px: p.x,
              py: p.y,
              owned: isNodeOwned(state, node),
            })
          }
        }
        if (node.hubId) {
          const w = tileCenter(node.id)
          const h = tileCenter(node.hubId)
          if (w && h) {
            segs.push({
              key: `${node.id}->hub:${node.hubId}`,
              cx: w.x,
              cy: w.y,
              px: h.x,
              py: h.y,
              horizontal: true,
              owned: isNodeOwned(state, node),
            })
          }
        }
      }
      setSegments(segs)
      setTreeSize({ w: base.width, h: base.height })
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(tree)
    return () => ro.disconnect()
  }, [nodes, state])

  // Pin the scroll to the bottom (root) when switching trees, like the game.
  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (viewport) viewport.scrollTop = viewport.scrollHeight
  }, [activeTree])

  const handleSelect = useCallback((id: string) => setSelectedId(id), [])

  const performReset = useCallback(() => {
    setResetConfirmOpen(false)
    updateState((prev) => respecVault(prev))
  }, [updateState])

  useEffect(() => {
    if (!resetConfirmOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setResetConfirmOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [resetConfirmOpen])

  const toolbar = (
    <div className="select-research__toolbar">
      <div className="select-research__toolbar-quick select-research__toolbar-quick--guardians-only">
        <button
          type="button"
          className="glow-btn glow-btn--danger glow-btn--block"
          onClick={() => setResetConfirmOpen(true)}
          aria-label={t('vault_reset_aria')}
        >
          {t('vault_reset')}
        </button>
      </div>
    </div>
  )

  return (
    <div className={embeddedInPanel ? 'vault-page vault-page--embedded' : 'vault-page'}>
      {toolbarMount ? createPortal(toolbar, toolbarMount) : toolbar}

      <div className="vault-page__tabs" role="tablist" aria-label={t('vault_title')}>
        {(['harmony', 'power'] as const).map((tree) => (
          <button
            key={tree}
            type="button"
            role="tab"
            aria-selected={activeTree === tree}
            className={
              activeTree === tree
                ? 'vault-page__tab vault-page__tab--on'
                : 'vault-page__tab'
            }
            onClick={() => switchTree(tree)}
          >
            {t(tree === 'power' ? 'vault_tab_power' : 'vault_tab_harmony')}
          </button>
        ))}
      </div>

      <div className="vault-page__viewport" ref={viewportRef}>
        <div
          className="vault-page__tree"
          ref={treeRef}
          style={{ gridTemplateRows: `repeat(${maxOrder + 1}, auto)` }}
        >
          <svg
            className="vault-page__connectors"
            width={treeSize.w || undefined}
            height={treeSize.h || undefined}
            aria-hidden
          >
            {segments.map((seg) => (
              <polyline
                key={seg.key}
                className={
                  seg.owned
                    ? 'vault-page__connector vault-page__connector--on'
                    : 'vault-page__connector'
                }
                points={
                  seg.horizontal
                    ? `${seg.cx},${seg.cy} ${seg.px},${seg.py}`
                    : `${seg.cx},${seg.cy} ${seg.cx},${seg.py} ${seg.px},${seg.py}`
                }
                fill="none"
              />
            ))}
          </svg>

          {nodes.map((node) => {
            const tier = ownedTierOf(state, node)
            const owned = tier >= 1
            const parent = vaultParentOf(node)
            const available = !owned && (!parent || isNodeOwned(state, parent))
            const tileClass = [
              'vault-node',
              `vault-node--${node.column}`,
              owned ? 'vault-node--owned' : available ? 'vault-node--available' : 'vault-node--locked',
              node.kind === 'tierUnlock' ? 'vault-node--tier' : '',
              selectedId === node.id ? 'vault-node--selected' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button
                key={node.id}
                type="button"
                ref={(el) => {
                  nodeRefs.current.set(node.id, el)
                }}
                className={tileClass}
                style={{ gridRow: maxOrder - node.order + 1, gridColumn: COLUMN_INDEX[node.column] }}
                onClick={() => handleSelect(node.id)}
                aria-pressed={selectedId === node.id}
                aria-label={t(node.nameId)}
              >
                <span className="vault-node__tile">
                  <VaultNodeIcon iconId={node.iconId} fallback={node.valueLabel} className="vault-node__icon" />
                  {tier > 1 ? <span className="vault-node__tier-badge">{`T${tier}`}</span> : null}
                </span>
                <span className="vault-node__cost">
                  {node.keyCost}
                  <VaultKeyGlyph className="vault-node__cost-key" />
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {selected ? (
        <VaultDetailPanel
          node={selected}
          state={state}
          onChange={updateState}
          t={t}
        />
      ) : null}

      {resetConfirmOpen
        ? createPortal(
            <div
              className="select-research__reset-confirm-backdrop"
              role="presentation"
              onClick={() => setResetConfirmOpen(false)}
            >
              <div
                className="select-research__reset-confirm-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="vault-reset-title"
                aria-describedby="vault-reset-desc"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 id="vault-reset-title" className="select-research__reset-confirm-title">
                  {t('vault_reset_confirm_title')}
                </h2>
                <p id="vault-reset-desc" className="select-research__reset-confirm-desc">
                  {t('vault_reset_confirm_body')}
                </p>
                <div className="select-research__reset-confirm-actions">
                  <button
                    type="button"
                    className="glow-btn glow-btn--block"
                    onClick={() => setResetConfirmOpen(false)}
                  >
                    {t('sr_cancel')}
                  </button>
                  <button
                    type="button"
                    className="glow-btn glow-btn--danger glow-btn--block"
                    onClick={performReset}
                  >
                    {t('vault_reset_confirm')}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

type DetailProps = {
  node: VaultNode
  state: VaultState
  onChange: (updater: (prev: VaultState) => VaultState) => void
  t: (id: StringId) => string
}

function VaultDetailPanel({ node, state, onChange, t }: DetailProps) {
  const tier = ownedTierOf(state, node)
  const maxTier = vaultMaxTier(node)
  const parent = vaultParentOf(node)
  const parentOwned = !parent || isNodeOwned(state, parent)
  const desc = t(node.descId).replace('{v}', node.valueLabel)

  const handleHarmonyToggle = () => onChange((prev) => toggleHarmonyNode(prev, node.id))
  const handleSetTier = (next: number) => onChange((prev) => setPowerNodeTier(prev, node.id, next))

  let action: ReactNode
  if (node.tree === 'harmony') {
    action = parentOwned || tier >= 1 ? (
      <button
        type="button"
        className={tier >= 1 ? 'vault-detail__btn vault-detail__btn--owned' : 'vault-detail__btn vault-detail__btn--unlock'}
        onClick={handleHarmonyToggle}
      >
        {tier >= 1 ? t('vault_owned') : (
          <>
            {t('vault_unlock')} {node.keyCost}
            <VaultKeyGlyph className="vault-detail__btn-key" />
          </>
        )}
      </button>
    ) : (
      <button type="button" className="vault-detail__btn" disabled>
        {t('vault_locked')}
      </button>
    )
  } else if (node.kind === 'tierUnlock') {
    const t1 = countPowerUnlocksAtTier(state, 1)
    const t2 = countPowerUnlocksAtTier(state, 2)
    const req =
      node.tierGate === 't2'
        ? t('vault_tier2_req').replace('{n}', String(VAULT_TIER2_REQ_T1)).replace('{c}', String(t1))
        : t('vault_tier3_req')
            .replace('{a}', String(VAULT_TIER3_REQ_T1))
            .replace('{b}', String(VAULT_TIER3_REQ_T2))
            .replace('{c1}', String(t1))
            .replace('{c2}', String(t2))
    const canBuy = canOwnTier(state, node, 1)
    action = (
      <div className="vault-detail__tier-unlock">
        <span className="vault-detail__req">{req}</span>
        <button
          type="button"
          className={
            tier >= 1
              ? 'vault-detail__btn vault-detail__btn--owned'
              : 'vault-detail__btn vault-detail__btn--unlock'
          }
          disabled={tier < 1 && !canBuy}
          onClick={() => handleSetTier(tier >= 1 ? 0 : 1)}
        >
          {tier >= 1 ? t('vault_owned') : (
            <>
              {t('vault_unlock')} {node.keyCost}
              <VaultKeyGlyph className="vault-detail__btn-key" />
            </>
          )}
        </button>
      </div>
    )
  } else {
    // Power upgrade with up to 3 tiers.
    const nextTier = tier + 1
    const canUpgrade = nextTier <= maxTier && canOwnTier(state, node, nextTier)
    let lockedReason: string | null = null
    if (!canUpgrade && nextTier <= maxTier) {
      if (!parentOwned) lockedReason = t('vault_requires_parent')
      else if (nextTier === 2 && !isTierUnlocked(state, 't2')) lockedReason = t('vault_tier_locked_t2')
      else if (nextTier === 3 && !isTierUnlocked(state, 't3')) lockedReason = t('vault_tier_locked_t3')
    }
    action = (
      <div className="vault-detail__tiers">
        <span className="vault-detail__tier-state">
          {maxTier > 1 ? t('vault_tier_of').replace('{n}', String(tier)).replace('{max}', String(maxTier)) : null}
        </span>
        <div className="vault-detail__tier-actions">
          {tier >= 1 ? (
            <button
              type="button"
              className="vault-detail__btn vault-detail__btn--remove"
              onClick={() => handleSetTier(tier - 1)}
            >
              {t('vault_remove')}
            </button>
          ) : null}
          {nextTier <= maxTier ? (
            <button
              type="button"
              className="vault-detail__btn vault-detail__btn--unlock"
              disabled={!canUpgrade}
              onClick={() => handleSetTier(nextTier)}
            >
              {maxTier > 1
                ? t('vault_upgrade_to_tier').replace('{n}', String(nextTier))
                : t('vault_unlock')}{' '}
              {vaultKeyCostForTier(node, nextTier as 1 | 2 | 3)}
              <VaultKeyGlyph className="vault-detail__btn-key" />
            </button>
          ) : (
            <span className="vault-detail__max">{t('vault_max')}</span>
          )}
        </div>
        {lockedReason ? <span className="vault-detail__locked-reason">{lockedReason}</span> : null}
      </div>
    )
  }

  return (
    <div className="vault-detail">
      <div className="vault-detail__icon-wrap">
        <VaultNodeIcon iconId={node.iconId} fallback={node.valueLabel} className="vault-detail__icon" />
      </div>
      <div className="vault-detail__body">
        <h3 className="vault-detail__title">{t(node.nameId)}</h3>
        <p className="vault-detail__desc">{desc}</p>
      </div>
      <div className="vault-detail__action">{action}</div>
    </div>
  )
}
