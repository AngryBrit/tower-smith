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

/** TowerSmith community Discord (new tab). */
export const DISCORD_URL = 'https://discord.gg/KBh4GK7P'
