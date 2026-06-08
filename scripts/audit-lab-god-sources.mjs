/**
 * Audits tables/labs JSON provenance (screenshot vs shared ladder vs alias copy).
 * Run: node scripts/audit-lab-god-sources.mjs
 * Writes: docs/lab-god-source-audit.md
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const labsRoot = path.join(root, 'tables/labs')
const scriptsDir = path.join(root, 'scripts')
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'scripts/data/lab-god-manifest.json'), 'utf8'),
)

/**
 * In-game calculator verified: all members share one marginal ladder.
 * Screenshot source is maintained on `sourceRel` only; alias copies are GOD-correct.
 */
const VERIFIED_SHARED_LADDERS = [
  {
    id: 'bc-group1-resistances',
    label: 'BC Group 1 resistances',
    sourceRel: 'battle-condition/knockback-resistance.json',
    sourceName: 'Knockback Resistance',
    sourceScript: 'gen-knockback-resistance-lab-table.mjs',
    verifiedAt: '2026-06-08',
    members: [
      'battle-condition/knockback-resistance.json',
      'battle-condition/thorns-resistance.json',
      'battle-condition/orb-resistance.json',
      'battle-condition/plasma-cannon-resistance.json',
      'battle-condition/death-ray-resistance.json',
    ],
  },
  {
    id: 'bc-group2-enemy-buffs',
    label: 'BC Group 2 enemy buffs',
    sourceRel: 'battle-condition/armored-enemies.json',
    sourceName: 'Armored Enemies',
    sourceScript: 'gen-armored-enemies-lab-table.mjs',
    verifiedAt: '2026-06-08',
    members: [
      'battle-condition/armored-enemies.json',
      'battle-condition/enemy-speed.json',
      'battle-condition/more-enemies.json',
      'battle-condition/enemy-attack-speed.json',
    ],
  },
  {
    id: 'bc-group3-enemy-ultimates',
    label: 'BC Group 3 enemy ultimates',
    sourceRel: 'battle-condition/fast-ultimate.json',
    sourceName: "Fast's Ultimate",
    sourceScript: 'gen-bc-group3-enemy-ultimate-labs.mjs',
    verifiedAt: '2026-06-08',
    members: [
      'battle-condition/fast-ultimate.json',
      'battle-condition/ranged-ultimate.json',
      'battle-condition/boss-ultimate.json',
      'battle-condition/basic-ultimate.json',
      'battle-condition/tank-ultimate.json',
      'battle-condition/protector-ultimate.json',
    ],
  },
  {
    id: 'bc-group4-uw-duration-cluster',
    label: 'BC Group 4 UW duration cluster',
    sourceRel: 'battle-condition/ultimate-weapon-durations.json',
    sourceName: 'Ultimate Weapon Durations',
    sourceScript: 'gen-ultimate-weapon-durations-lab-table.mjs',
    verifiedAt: '2026-06-08',
    members: [
      'battle-condition/ultimate-weapon-durations.json',
      'battle-condition/death-defy-down.json',
      'battle-condition/energy-shields-down.json',
      'battle-condition/enemy-level-skip-reduction.json',
    ],
  },
  {
    id: 'enemies-ray-scatter-vampire-cluster',
    label: 'Enemies — Ray / Scatter / Vampire cluster',
    sourceRel: 'enemies/ray-enemy-attack.json',
    sourceName: 'Ray Enemy Attack',
    sourceScript: 'gen-ray-enemy-attack-lab-table.mjs',
    verifiedAt: '2026-06-08',
    members: [
      'enemies/ray-enemy-attack.json',
      'enemies/ray-enemy-health.json',
      'enemies/scatter-enemy-attack.json',
      'enemies/scatter-enemy-health.json',
      'enemies/vampire-enemy-attack.json',
      'enemies/vampire-enemy-health.json',
    ],
  },
  {
    id: 'main-enhancement-coin-discount-cluster',
    label: 'Main — Enhancement coin discount cluster',
    sourceRel: 'main/enhancement-attack-coin-discount.json',
    sourceName: 'Enhancement Attack - Coin Discount',
    sourceScript: 'gen-enhancement-coin-discount-lab-table.mjs',
    verifiedAt: '2026-06-08',
    members: [
      'main/enhancement-attack-coin-discount.json',
      'main/enhancement-defense-coin-discount.json',
      'main/enhancement-utility-coin-discount.json',
    ],
  },
  {
    id: 'modules-assist-module-cluster',
    label: 'Modules — Assist Module Substats/Bonus cluster',
    sourceRel: 'modules/assist-module-substats-cannon.json',
    sourceName: 'Assist Module Substats - Cannon',
    sourceScript: 'gen-assist-module-substats-cannon-lab-table.mjs',
    verifiedAt: '2026-06-08',
    members: [
      'modules/assist-module-substats-cannon.json',
      'modules/assist-module-substats-armor.json',
      'modules/assist-module-substats-generator.json',
      'modules/assist-module-substats-core.json',
      'modules/assist-module-bonus-cannon.json',
      'modules/assist-module-bonus-armor.json',
      'modules/assist-module-bonus-generator.json',
      'modules/assist-module-bonus-core.json',
    ],
  },
]

const verifiedRelMeta = new Map()
for (const group of VERIFIED_SHARED_LADDERS) {
  for (const rel of group.members) {
    verifiedRelMeta.set(rel, {
      groupId: group.id,
      groupLabel: group.label,
      isSource: rel === group.sourceRel,
      sourceRel: group.sourceRel,
      sourceName: group.sourceName,
      sourceScript: group.sourceScript,
      verifiedAt: group.verifiedAt,
    })
  }
}

function walkJson(dir, base = '') {
  const out = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${ent.name}` : ent.name
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...walkJson(p, rel))
    else if (ent.name.endsWith('.json') && ent.name !== 'lab-order.json') {
      out.push(rel.replace(/\\/g, '/'))
    }
  }
  return out.sort()
}

function readScriptText(file) {
  try {
    return fs.readFileSync(file, 'utf8')
  } catch {
    return ''
  }
}

function findGenScript(rel) {
  const candidates = fs.readdirSync(scriptsDir).filter(
    (f) => f.startsWith('gen-') && f.endsWith('.mjs'),
  )
  for (const f of candidates) {
    const text = fs.readFileSync(path.join(scriptsDir, f), 'utf8')
    if (text.includes(rel)) return f
  }
  const base = path.basename(rel, '.json')
  return (
    candidates.find((f) => f.includes(base.replace(/-/g, '-'))) ??
    candidates.find((f) => f.replace(/^gen-|-lab-table\.mjs$/g, '') === base) ??
    null
  )
}

function ladderFingerprint(doc) {
  return JSON.stringify(
    (doc.levels ?? []).map((r) => ({
      t: r.time?.display ?? r.time,
      g: r.gems,
      c: r.coins,
      tt: r.totalTime?.display ?? r.totalTime,
      tg: r.totalGems,
      tc: r.totalCoins,
    })),
  )
}

function classify(rel, script, scriptText, createdFrom, verified) {
  const tags = []
  const head = scriptText.slice(0, 2500)
  if (verified) {
    tags.push(verified.isSource ? 'verified-shared-ladder-source' : 'verified-shared-ladder')
  } else if (createdFrom) {
    tags.push('alias-copy')
  }
  if (/interpolat/i.test(scriptText)) tags.push('interpolated')
  if (/wiki/i.test(scriptText)) tags.push('wiki-sourced')
  if (
    /same cost ladder|shared attack ladder|shared ladder|matches .+ ladder|marginal time\/gem\/coin rows match|marginal time \(seconds\), gems, and coins match/i.test(
      scriptText,
    )
  ) {
    tags.push('shared-cost-ladder')
  }
  if (/\+.*\/level|calculator value \d/i.test(scriptText)) tags.push('formula-value-column')
  if (/bc group 3|buildBcGroup3/i.test(scriptText)) tags.push('bc-group3-shared-rows')
  if (
    /from screenshot only|screenshot data only|screenshot L\d|calculator screenshots only/i.test(
      head,
    ) &&
    !tags.includes('wiki-sourced')
  ) {
    tags.push('screenshot-transcribed')
  }

  let primary
  if (tags.includes('verified-shared-ladder-source')) primary = 'verified-shared-ladder-source'
  else if (tags.includes('verified-shared-ladder')) primary = 'verified-shared-ladder'
  else if (tags.includes('alias-copy')) primary = 'alias-copy'
  else if (tags.includes('interpolated')) primary = 'interpolated'
  else if (tags.includes('wiki-sourced')) primary = 'wiki-sourced'
  else if (tags.includes('bc-group3-shared-rows')) primary = 'bc-group3-shared-rows'
  else if (tags.includes('shared-cost-ladder')) primary = 'shared-cost-ladder'
  else if (tags.includes('screenshot-transcribed')) primary = 'screenshot-transcribed'
  else if (script) primary = 'has-generator-unclassified'
  else primary = 'no-generator'

  return { primary, tags }
}

const createdByRel = new Map((manifest.created ?? []).map((c) => [c.outRel, c.from]))
const rels = walkJson(labsRoot)
const docs = rels.map((rel) => {
  const doc = JSON.parse(fs.readFileSync(path.join(labsRoot, rel), 'utf8'))
  const script = findGenScript(rel)
  const scriptText = script ? readScriptText(path.join(scriptsDir, script)) : ''
  const createdFrom = createdByRel.get(rel)
  const verified = verifiedRelMeta.get(rel)
  const { primary, tags } = classify(rel, script, scriptText, createdFrom, verified)
  return {
    rel,
    name: doc.name,
    script,
    primary,
    tags,
    createdFrom,
    verified,
    fp: ladderFingerprint(doc),
  }
})

const byFp = new Map()
for (const d of docs) {
  if (!byFp.has(d.fp)) byFp.set(d.fp, [])
  byFp.get(d.fp).push(d)
}
const dupGroups = [...byFp.values()].filter((g) => g.length > 1)

const counts = {}
for (const d of docs) counts[d.primary] = (counts[d.primary] ?? 0) + 1

const lines = []
lines.push('# tables/labs GOD source audit')
lines.push('')
lines.push(`Generated: ${new Date().toISOString()}`)
lines.push(`Total JSON files: ${docs.length}`)
lines.push('')
lines.push('## Summary by primary category')
lines.push('')
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  lines.push(`- **${k}**: ${v}`)
}
lines.push('')
lines.push('## Category definitions')
lines.push('')
lines.push('| Category | Meaning |')
lines.push('|----------|---------|')
lines.push(
  "| screenshot-transcribed | Per-level rows hardcoded from that lab's calculator screenshot |",
)
lines.push(
  '| shared-cost-ladder | Marginal time/gems/coins from another lab\'s screenshot ladder (per gen script comment) |',
)
lines.push(
  '| formula-value-column | Benefit/value uses linear formula; cost/time may be screenshot or shared |',
)
lines.push(
  '| alias-copy | JSON duplicated by ensure-all-lab-god-json.mjs (only `name` changed) |',
)
lines.push('| interpolated | Gen script documents interpolated cells |')
lines.push('| wiki-sourced | Gen script uses wiki data for some columns |')
lines.push('| bc-group3-shared-rows | BC Group 3 enemy ultimates share one row set |')
lines.push(
  '| verified-shared-ladder-source | Screenshot source for a user-verified shared in-game ladder |',
)
lines.push(
  '| verified-shared-ladder | Alias copy; calculator confirmed identical to verified source |',
)
lines.push('| has-generator-unclassified | Has gen script but unclear header |')
lines.push('| no-generator | No matching gen script |')
lines.push('')
lines.push('## Verified shared ladders (calculator-confirmed)')
lines.push('')
for (const group of VERIFIED_SHARED_LADDERS) {
  lines.push(`### ${group.label}`)
  lines.push('')
  lines.push(`Verified: ${group.verifiedAt}. Screenshot source: **${group.sourceName}** (\`${group.sourceRel}\`, \`${group.sourceScript}\`).`)
  lines.push('')
  lines.push('No separate re-import needed for alias members.')
  lines.push('')
  for (const rel of group.members) {
    const d = docs.find((x) => x.rel === rel)
    const role =
      rel === group.sourceRel
        ? 'screenshot source'
        : `alias ← ${group.sourceName}`
    lines.push(`- \`${rel}\` — ${d?.name ?? rel} (${role})`)
  }
  lines.push('')
}
lines.push('## Interpolated (documented in generator)')
lines.push('')
for (const d of docs.filter((x) => x.tags.includes('interpolated'))) {
  lines.push(`- \`${d.rel}\` — ${d.name} (\`${d.script}\`)`)
}
if (!docs.some((x) => x.tags.includes('interpolated'))) lines.push('- (none)')
lines.push('')
lines.push('## Wiki-sourced (documented in generator)')
lines.push('')
for (const d of docs.filter((x) => x.tags.includes('wiki-sourced'))) {
  lines.push(`- \`${d.rel}\` — ${d.name} (\`${d.script}\`)`)
}
if (!docs.some((x) => x.tags.includes('wiki-sourced'))) lines.push('- (none)')
lines.push('')
lines.push('## Alias-copied — needs review (ensure-all-lab-god-json.mjs)')
lines.push('')
const aliasNeedsReview = docs
  .filter((x) => x.tags.includes('alias-copy'))
  .sort((a, b) => a.rel.localeCompare(b.rel))
for (const d of aliasNeedsReview) {
  lines.push(`- \`${d.rel}\` — ${d.name} ← **${d.createdFrom}**`)
}
if (!aliasNeedsReview.length) lines.push('- (none)')
lines.push('')
lines.push('## Shared-cost-ladder (documented in generator)')
lines.push('')
for (const d of docs
  .filter((x) => x.tags.includes('shared-cost-ladder'))
  .sort((a, b) => a.rel.localeCompare(b.rel))) {
  lines.push(`- \`${d.rel}\` — ${d.name} (\`${d.script}\`)`)
}
lines.push('')
lines.push('## Identical cost/time ladders (duplicate fingerprint)')
lines.push('')
for (const g of dupGroups.sort((a, b) => b.length - a.length)) {
  lines.push(`### Group of ${g.length}`)
  for (const d of g) {
    const aliasNote = d.verified
      ? ` (verified shared ladder ← ${d.verified.sourceName})`
      : d.createdFrom
        ? ` (alias from ${d.createdFrom})`
        : ''
    lines.push(`- \`${d.rel}\` — ${d.name}${aliasNote}`)
  }
  lines.push('')
}
lines.push('## Full inventory')
lines.push('')
lines.push('| File | Lab | Primary | Generator | Notes |')
lines.push('|------|-----|---------|-----------|-------|')
for (const d of docs) {
  const notes = []
  if (d.verified) {
    notes.push(
      d.verified.isSource
        ? `verified shared ladder source (${d.verified.groupId})`
        : `verified shared ladder←${d.verified.sourceName}`,
    )
  } else if (d.createdFrom) {
    notes.push(`alias←${d.createdFrom}`)
  }
  if (d.tags.includes('formula-value-column')) notes.push('formula value')
  if (d.tags.includes('interpolated')) notes.push('interpolated')
  if (d.tags.includes('wiki-sourced')) notes.push('wiki')
  if (d.tags.includes('shared-cost-ladder')) notes.push('shared ladder')
  lines.push(
    `| \`${d.rel}\` | ${d.name} | ${d.primary} | ${d.script ?? '—'} | ${notes.join('; ') || '—'} |`,
  )
}

const outPath = path.join(root, 'docs/lab-god-source-audit.md')
fs.writeFileSync(outPath, lines.join('\n') + '\n')
console.log('Wrote', outPath)
console.log('Summary:', counts)
console.log('Duplicate ladder groups:', dupGroups.length)
