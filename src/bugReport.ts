import {
  APP_VERSION,
  BUG_REPORT_ISSUES_URL,
  BUG_REPORT_SUPPORT_EMAIL,
} from './appVersion'
import type { BugReportCsvAttachment } from './bugReportCsvAttachment'
import {
  formatSaveBytes,
  type BugReportSaveAttachment,
} from './bugReportSaveAttachment'
import { readColorSchemePreference } from './colorSchemePreference'
import { readStoredLocale } from './i18n/constants'
import {
  extractLabWorkspaceFromPresetsFile,
  parseLabPresetsFile,
} from './labPresetsStorage'
import { readMainPanel, type MainPanel } from './mainPanelStorage'
import { supabaseBrowserConfigured } from './supabase/client'
import { TOWER_LAB_PRESETS_STORAGE_KEY } from './towerWorkspacePresets'
import { WIKI_DATA_STAMP } from './wikiDataStamp'

export const BUG_REPORT_CATEGORIES = [
  'crash',
  'wrong_stat',
  'import',
  'share_gallery',
  'ui',
  'other',
] as const

export type BugReportCategory = (typeof BUG_REPORT_CATEGORIES)[number]

export type BugReportErrorContext = {
  error: Error
  componentStack?: string | null
  panelId?: MainPanel
  panelLabel?: string
}

export type BugReportInput = {
  category: BugReportCategory
  /** Localized label for the category (included in the pasted report). */
  categoryLabel: string
  description: string
  steps?: string
  signedIn?: boolean
  mainPanel?: MainPanel
  mainPanelLabel?: string
  errorContext?: BugReportErrorContext
  saveAttachment?: BugReportSaveAttachment
  csvAttachment?: BugReportCsvAttachment
}

export type BugReportEnvironment = {
  version: string
  mainPanel: MainPanel
  locale: string
  colorScheme: string
  url: string
  wikiDataAlignedAt: string | null
  userAgent: string
  online: boolean
  viewport: string
  labOverrideCount: number
  galleryBackendConfigured: boolean
  signedIn: boolean
}

const MODULES_PANEL_ENABLED = true

function countLabOverridesFromStorage(): number {
  try {
    const raw = localStorage.getItem(TOWER_LAB_PRESETS_STORAGE_KEY)
    if (!raw) return 0
    const parsed = parseLabPresetsFile(JSON.parse(raw) as unknown)
    if (!parsed) return 0
    return Object.keys(extractLabWorkspaceFromPresetsFile(parsed).levelOverrides).length
  } catch {
    return 0
  }
}

/** Safe, non-PII environment snapshot for bug reports. */
export function collectBugReportEnvironment(options?: {
  mainPanel?: MainPanel
  signedIn?: boolean
}): BugReportEnvironment {
  const viewport =
    typeof window !== 'undefined'
      ? `${window.innerWidth}×${window.innerHeight}`
      : 'unknown'

  return {
    version: APP_VERSION,
    mainPanel: options?.mainPanel ?? readMainPanel(MODULES_PANEL_ENABLED),
    locale: readStoredLocale(),
    colorScheme: readColorSchemePreference(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    wikiDataAlignedAt: WIKI_DATA_STAMP.alignedAt?.trim() || null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    viewport,
    labOverrideCount: countLabOverridesFromStorage(),
    galleryBackendConfigured: supabaseBrowserConfigured(),
    signedIn: options?.signedIn === true,
  }
}

function formatEnvironmentBlock(env: BugReportEnvironment): string[] {
  return [
    `TowerSmith v${env.version}`,
    `Panel: ${env.mainPanel}`,
    `Locale: ${env.locale}`,
    `Color scheme: ${env.colorScheme}`,
    `URL: ${env.url}`,
    `Wiki data: ${env.wikiDataAlignedAt ?? 'unknown'}`,
    `Online: ${env.online ? 'yes' : 'no'}`,
    `Viewport: ${env.viewport}`,
    `Lab overrides (count): ${env.labOverrideCount}`,
    `Gallery backend: ${env.galleryBackendConfigured ? 'configured' : 'not configured'}`,
    `Signed in: ${env.signedIn ? 'yes' : 'no'}`,
    `User-Agent: ${env.userAgent}`,
  ]
}

function formatErrorBlock(ctx: BugReportErrorContext): string[] {
  const lines = [`Error: ${ctx.error.message}`]
  if (ctx.panelLabel || ctx.panelId) {
    lines.unshift(`Crash panel: ${ctx.panelLabel ?? ctx.panelId} (${ctx.panelId ?? '?'})`)
  }
  if (ctx.error.stack) {
    lines.push('', ctx.error.stack.trim())
  }
  if (ctx.componentStack?.trim()) {
    lines.push('', 'Component stack:', ctx.componentStack.trim())
  }
  return lines
}

function formatSaveAttachmentBlock(attachment: BugReportSaveAttachment): string[] {
  return [
    `File: ${attachment.fileName}`,
    `Size: ${formatSaveBytes(attachment.sizeBytes)} (${attachment.sizeBytes} bytes)`,
    `Gzip: ${attachment.gzip ? 'yes' : 'no'}`,
    `SHA-256: ${attachment.sha256Hex}`,
    '',
    'Attach this same playerInfo.dat file when sending email or opening a GitHub issue.',
  ]
}

function formatCsvAttachmentBlock(attachment: BugReportCsvAttachment): string[] {
  return [
    `File: ${attachment.fileName}`,
    `Size: ${formatSaveBytes(attachment.sizeBytes)} (${attachment.sizeBytes} bytes)`,
    `Format: ${attachment.towerCsv ? 'tower_csv_v1' : 'unknown'}`,
    `SHA-256: ${attachment.sha256Hex}`,
    '',
    'Attach this same tower CSV export when sending email or opening a GitHub issue.',
  ]
}

/** Full diagnostic text for clipboard (no raw save file bytes). */
export function buildBugReport(
  input: BugReportInput,
  env: BugReportEnvironment = collectBugReportEnvironment({
    mainPanel: input.mainPanel,
    signedIn: input.signedIn,
  }),
): string {
  const sections: string[] = []

  sections.push(
    '=== TowerSmith bug report ===',
    '',
    `Category: ${input.categoryLabel} (${input.category})`,
  )

  if (input.mainPanelLabel || input.mainPanel) {
    sections.push(
      `Active tab: ${input.mainPanelLabel ?? input.mainPanel} (${input.mainPanel ?? env.mainPanel})`,
    )
  }

  sections.push('', '--- What happened ---', input.description.trim())

  const steps = input.steps?.trim()
  if (steps) {
    sections.push('', '--- Steps to reproduce ---', steps)
  }

  sections.push('', '--- Environment ---', ...formatEnvironmentBlock(env))

  if (input.saveAttachment) {
    sections.push('', '--- Save attachment (metadata) ---', ...formatSaveAttachmentBlock(input.saveAttachment))
  }

  if (input.csvAttachment) {
    sections.push('', '--- CSV export (metadata) ---', ...formatCsvAttachmentBlock(input.csvAttachment))
  }

  if (input.errorContext) {
    sections.push('', '--- Error ---', ...formatErrorBlock(input.errorContext))
  }

  return sections.join('\n')
}

function truncateForGitHub(text: string, max: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

const MAILTO_BODY_MAX = 1800

/**
 * mailto query strings: use %20 for spaces, not +.
 * URLSearchParams uses application/x-www-form-urlencoded (+ for space);
 * many mail clients (Outlook, Apple Mail, etc.) leave + literal in subject/body.
 */
function buildMailtoQueryString(params: Record<string, string>): string {
  return new URLSearchParams(params).toString().replace(/\+/g, '%20')
}

function buildIssueBodyLines(
  input: BugReportInput,
  env: BugReportEnvironment,
): string[] {
  const bodyLines = ['### What happened', input.description.trim()]

  const steps = input.steps?.trim()
  if (steps) {
    bodyLines.push('', '### Steps to reproduce', steps)
  }

  bodyLines.push(
    '',
    '### Context',
    `- **TowerSmith:** v${env.version}`,
    `- **Category:** ${input.categoryLabel}`,
    `- **Panel:** ${input.mainPanelLabel ?? input.mainPanel ?? env.mainPanel}`,
    `- **URL:** ${env.url}`,
    `- **Locale:** ${env.locale}`,
  )

  if (input.saveAttachment) {
    bodyLines.push(
      '',
      '### Save file',
      `- **File:** ${input.saveAttachment.fileName} (${formatSaveBytes(input.saveAttachment.sizeBytes)})`,
      `- **Gzip:** ${input.saveAttachment.gzip ? 'yes' : 'no'}`,
      `- **SHA-256:** \`${input.saveAttachment.sha256Hex}\``,
      '',
      '_Attach the same **playerInfo.dat** in this issue (drag-and-drop below)._',
    )
  }

  if (input.csvAttachment) {
    bodyLines.push(
      '',
      '### Tower CSV export',
      `- **File:** ${input.csvAttachment.fileName} (${formatSaveBytes(input.csvAttachment.sizeBytes)})`,
      `- **Format:** tower_csv_v1`,
      `- **SHA-256:** \`${input.csvAttachment.sha256Hex}\``,
      '',
      '_Attach the same **tower CSV** in this issue (drag-and-drop below)._',
    )
  }

  if (input.errorContext) {
    bodyLines.push(
      '',
      '### Error',
      '```',
      truncateForGitHub(input.errorContext.error.message, 500),
      '```',
    )
  }

  bodyLines.push(
    '',
    '_If you used **Copy report** in Bug Buster, paste the full diagnostics below._',
  )

  return bodyLines
}

function buildIssueSubject(input: BugReportInput): string {
  return truncateForGitHub(
    `[${input.category}] ${input.description.split(/\r?\n/)[0] ?? 'Bug report'}`,
    120,
  )
}

/** Prefilled GitHub new-issue URL (description + summary; user pastes full report if needed). */
export function buildGitHubIssueUrl(
  input: BugReportInput,
  env: BugReportEnvironment = collectBugReportEnvironment({
    mainPanel: input.mainPanel,
    signedIn: input.signedIn,
  }),
): string {
  const params = new URLSearchParams({
    title: buildIssueSubject(input),
    body: buildIssueBodyLines(input, env).join('\n'),
  })

  return `${BUG_REPORT_ISSUES_URL}?${params.toString()}`
}

/** Plain-text body for mailto (length-limited). */
export function buildBugReportMailtoBody(
  input: BugReportInput,
  env: BugReportEnvironment = collectBugReportEnvironment({
    mainPanel: input.mainPanel,
    signedIn: input.signedIn,
  }),
): string {
  const lines = [
    'TowerSmith bug report',
    '',
    `Category: ${input.categoryLabel}`,
    '',
    'What happened:',
    input.description.trim(),
  ]

  const steps = input.steps?.trim()
  if (steps) {
    lines.push('', 'Steps to reproduce:', steps)
  }

  lines.push(
    '',
    `Version: v${env.version}`,
    `Panel: ${input.mainPanelLabel ?? input.mainPanel ?? env.mainPanel}`,
    `URL: ${env.url}`,
  )

  if (input.saveAttachment) {
    lines.push(
      '',
      'Save file (attach playerInfo.dat manually):',
      `- ${input.saveAttachment.fileName} (${formatSaveBytes(input.saveAttachment.sizeBytes)})`,
      `- SHA-256: ${input.saveAttachment.sha256Hex}`,
    )
  }

  if (input.csvAttachment) {
    lines.push(
      '',
      'Tower CSV (attach export manually):',
      `- ${input.csvAttachment.fileName} (${formatSaveBytes(input.csvAttachment.sizeBytes)})`,
      `- SHA-256: ${input.csvAttachment.sha256Hex}`,
    )
  }

  lines.push('', '---', 'Paste full diagnostics from Bug Buster Copy report if needed.')

  let body = lines.join('\n')
  if (body.length > MAILTO_BODY_MAX) {
    body = `${body.slice(0, MAILTO_BODY_MAX - 40)}\n\n…(truncated — use Copy report for full text)`
  }
  return body
}

/** Plain-text subject + body for pasting into webmail when mailto encoding fails. */
export function buildBugReportEmailClipboardText(
  input: BugReportInput,
  env: BugReportEnvironment = collectBugReportEnvironment({
    mainPanel: input.mainPanel,
    signedIn: input.signedIn,
  }),
): string {
  const subject = truncateForGitHub(
    `[TowerSmith] ${buildIssueSubject(input)}`,
    120,
  )
  return `Subject: ${subject}\n\n${buildBugReportMailtoBody(input, env)}`
}

/** Opens the default mail client with a prefilled support message. */
export function buildBugReportMailtoUrl(
  input: BugReportInput,
  env: BugReportEnvironment = collectBugReportEnvironment({
    mainPanel: input.mainPanel,
    signedIn: input.signedIn,
  }),
): string {
  const subject = truncateForGitHub(
    `[TowerSmith] ${buildIssueSubject(input)}`,
    120,
  )
  const query = buildMailtoQueryString({
    subject,
    body: buildBugReportMailtoBody(input, env),
  })
  return `mailto:${BUG_REPORT_SUPPORT_EMAIL}?${query}`
}

export { BUG_REPORT_SUPPORT_EMAIL }
