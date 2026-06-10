/**
 * Post the latest CHANGELOG.md section to a Discord webhook.
 *
 * Skips when the top version matches the previous changelog (e.g. typo edits).
 *
 * Env:
 *   DISCORD_CHANGELOG_WEBHOOK_URL — webhook URL (required to post; omit to no-op)
 *   CHANGELOG_PATH — default CHANGELOG.md
 *   PREVIOUS_CHANGELOG — prior file contents for version comparison
 *   DISCORD_CHANGELOG_FORCE — set to 1 to post even when version unchanged
 *   SITE_URL — default https://www.towersmith.com
 *
 * Manual test:
 *   DISCORD_CHANGELOG_WEBHOOK_URL=https://discord.com/api/webhooks/... node scripts/post-changelog-to-discord.mjs --force
 */
import { readFileSync } from 'node:fs'

const CHANGELOG_PATH = process.env.CHANGELOG_PATH ?? 'CHANGELOG.md'
const WEBHOOK_URL = process.env.DISCORD_CHANGELOG_WEBHOOK_URL
const FORCE =
  process.argv.includes('--force') || process.env.DISCORD_CHANGELOG_FORCE === '1'
const SITE_URL = process.env.SITE_URL ?? 'https://www.towersmith.com'
const CHANGELOG_URL = 'https://github.com/AngryBrit/tower-smith/blob/main/CHANGELOG.md'

const VERSION_HEADING_RE = /^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?/

/** @param {string} markdown */
function parseLatestSection(markdown) {
  const lines = markdown.split(/\r?\n/)
  let start = -1
  /** @type {string | null} */
  let version = null
  /** @type {string | null} */
  let date = null
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(VERSION_HEADING_RE)
    if (match) {
      start = i
      version = match[1]
      date = match[2] ?? null
      break
    }
  }
  if (start < 0 || version == null) return null

  const bodyLines = []
  for (let i = start + 1; i < lines.length; i++) {
    if (VERSION_HEADING_RE.test(lines[i])) break
    bodyLines.push(lines[i])
  }
  return { version, date, body: bodyLines.join('\n').trim() }
}

/** @param {string} body */
function discordDescription(body, max = 4000) {
  if (body.length <= max) return body
  const suffix = `\n\n…[full changelog](${CHANGELOG_URL})`
  return `${body.slice(0, max - suffix.length).trimEnd()}${suffix}`
}

async function main() {
  if (!WEBHOOK_URL) {
    console.log('DISCORD_CHANGELOG_WEBHOOK_URL not set; skipping Discord post.')
    return
  }

  const changelog = readFileSync(CHANGELOG_PATH, 'utf8')
  const latest = parseLatestSection(changelog)
  if (latest == null) {
    console.error('No version section found in CHANGELOG.md')
    process.exit(1)
  }

  const previousMarkdown = process.env.PREVIOUS_CHANGELOG
  if (!FORCE && previousMarkdown) {
    const previous = parseLatestSection(previousMarkdown)
    if (previous?.version === latest.version) {
      console.log(`Version ${latest.version} unchanged at top of CHANGELOG; skipping.`)
      return
    }
  }

  const title = `TowerSmith v${latest.version} released`
  /** @type {Record<string, unknown>} */
  const embed = {
    title,
    url: SITE_URL,
    description: discordDescription(latest.body),
    color: 0x3b82f6,
    footer: { text: 'TowerSmith' },
  }
  if (latest.date) {
    embed.timestamp = new Date(`${latest.date}T12:00:00Z`).toISOString()
  }

  const payload = {
    content: `**${title}** — [Open TowerSmith](${SITE_URL}) · [Changelog](${CHANGELOG_URL})`,
    embeds: [embed],
  }

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`Discord webhook failed (${res.status}): ${text}`)
    process.exit(1)
  }

  console.log(`Posted v${latest.version} to Discord.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
