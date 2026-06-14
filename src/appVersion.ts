import pkg from '../package.json' with { type: 'json' }

export const APP_VERSION: string = pkg.version

/** Release history on GitHub (new tab). */
export const CHANGELOG_URL =
  'https://github.com/AngryBrit/tower-smith/blob/main/CHANGELOG.md'

/** New bug report on GitHub (new tab; body prefilled from Bug Buster). */
export const BUG_REPORT_ISSUES_URL =
  'https://github.com/AngryBrit/tower-smith/issues/new'

/** Bug reports by email (Bug Buster mailto). */
export const BUG_REPORT_SUPPORT_EMAIL = 'support@towersmith.com'

/** TowerSmith community Discord invite (works for non-members). */
export const DISCORD_URL = 'https://discord.gg/hUDZ6nCmF3'

/** Support ticket panel channel (members only — deep link). */
export const DISCORD_SUPPORT_TICKET_CHANNEL_URL =
  'https://discord.com/channels/1513949363653705819/1515029805618429992'

/** Support ticket panel invite (join + land on ticket channel). */
export const DISCORD_SUPPORT_TICKET_URL = 'https://discord.gg/nvKCVbMGNb'
