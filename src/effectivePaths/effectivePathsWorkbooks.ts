/**
 * Effective Paths Google Drive layout (workbook titles in Drive may change; IDS tab links are authoritative).
 *
 * - **IDS Master** — paste its URL in TowerSmith; linked IDs live on the **IDS** tab (category rows).
 * - **IDS Collection** — all sheets combined into one workbook.
 * - **Relics** — relic data; tab **Relics** lists every relic (name col C, Unlocked col F).
 * - **Themes & Songs** — themes input tab; owned toggles in B/C, E/F, M/N, and Q/R blocks.
 *
 * TowerSmith reads linked IDs from IDS Master, then writes to the linked child workbooks.
 */

/** Workbook name in the IDS Master linked-ID table. */
export const EFFECTIVE_PATHS_RELICS_WORKBOOK_NAME = 'Relics'

/** Tab title inside the Relics workbook. */
export const EFFECTIVE_PATHS_RELICS_TAB_TITLE = 'Relics'

/** Workbook name in the IDS Master linked-ID table. */
export const EFFECTIVE_PATHS_THEMES_WORKBOOK_NAME = 'Themes & Songs'

/** Tab title inside the Themes & Songs workbook (red input sheet). */
export const EFFECTIVE_PATHS_THEMES_TAB_TITLE = 'Themes & Songs'
