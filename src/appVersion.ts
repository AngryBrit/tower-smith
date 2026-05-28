import pkg from '../package.json' with { type: 'json' }

export const APP_VERSION: string = pkg.version

/** Release history on GitHub (new tab). */
export const CHANGELOG_URL =
  'https://github.com/AngryBrit/tower-smith/blob/main/CHANGELOG.md'
