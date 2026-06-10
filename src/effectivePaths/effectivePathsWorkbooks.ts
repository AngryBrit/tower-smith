/**
 * Effective Paths Google Drive layout (workbook titles in Drive may change; IDS tab links are authoritative).
 *
 * - **IDS Master** — paste its URL in TowerSmith; linked IDs live on the **IDS** tab (category rows).
 * - **IDS Collection** — all sheets combined into one workbook.
 * - **Relics** — relic data; tab **Relics** lists every relic (name col C, Unlocked col F).
 *
 * TowerSmith reads linked IDs from IDS Master, then writes relics to the **Relics** workbook tab.
 */

/** Workbook name in the IDS Master linked-ID table. */
export const EFFECTIVE_PATHS_RELICS_WORKBOOK_NAME = 'Relics'

/** Tab title inside the Relics workbook. */
export const EFFECTIVE_PATHS_RELICS_TAB_TITLE = 'Relics'
