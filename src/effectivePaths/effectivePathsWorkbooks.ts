/**
 * Effective Paths Google Drive layout (workbook titles in Drive may change; IDS tab links are authoritative).
 *
 * - **IDS Master** — paste its URL in TowerSmith; linked IDs live on the **IDS** tab (category rows).
 * - **IDS Collection** — all sheets combined into one workbook.
 * - **Relics** — relic data; tab **Relics** lists every relic (name col C, Unlocked col F).
 * - **Themes & Songs** — themes input tab; owned toggles in B/C, E/F, M/N, and Q/R blocks.
 * - **Workshop** — upgrade data; Master Sheet tab with unlocked in B, names in C, levels in D.
 * - **Cards** — card data; Master Sheet tab with names in B, levels in C, mastery in D;
 *   Card Preset tab with loadouts in D/H/L/P/T (rows 5–32).
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

/** Workbook name in the IDS Master linked-ID table. */
export const EFFECTIVE_PATHS_WORKSHOP_WORKBOOK_NAME = 'Workshop'

/** Tab title inside the Workshop workbook (v3.x Master Sheet). */
export const EFFECTIVE_PATHS_WORKSHOP_TAB_TITLE = 'Master Sheet'

/** Workbook name in the IDS Master linked-ID table. */
export const EFFECTIVE_PATHS_CARDS_WORKBOOK_NAME = 'Cards'

/** Tab title inside the Cards workbook (v3.x Master Sheet). */
export const EFFECTIVE_PATHS_CARDS_TAB_TITLE = 'Master Sheet'

/** Tab title inside the Cards workbook (v3.x card loadout presets). */
export const EFFECTIVE_PATHS_CARD_PRESET_TAB_TITLE = 'Card Preset'
