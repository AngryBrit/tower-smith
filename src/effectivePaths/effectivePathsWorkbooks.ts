/**
 * Effective Paths Google Drive layout (workbook titles in Drive may change; IDS tab links are authoritative).
 *
 * - **IDS Master** — paste its URL in TowerSmith; linked IDs live on the **IDS** tab (category rows).
 * - **IDS Collection** — all category sheets in one workbook (`Lab_MS`, `Workshop_MS`, …); TowerSmith detects this layout automatically.
 * - **Relics** — relic data; tab **Relics** lists every relic (name col C, Unlocked col F).
 * - **Themes & Songs** — owned/name pairs in B/C, E/F, L/M (milestone/songs/guardians), and Q/R.
 * - **Workshop** — upgrade data; Master Sheet tab with unlocked in B, names in C, farming levels in D, max in N;
 *   Workshop Enhancements in P (name) and R (farming level / Preset 3; W is max on clean sheets).
 * - **Cards** — card data; Master Sheet tab with names in B, levels in C, mastery in D;
 *   Card Preset tab with loadouts in D/H/L/P/T (rows 5–32).
 * - **Laboratory** — research labs on Master Sheet (Labs=name, Level=current level) in each section block.
 * - **Bots** — bot medals + Bot+ on Master Sheet (C=unlocked, D=attribute, G/H=Farming lvl/Sync);
 *   BOTS lab levels in OTHERS (T=name, V=level).
 * - **Ultimate Weapon / UWs** — UW unlocked in C (C4, C8, …); basic + Plus levels in G (dropdown labels).
 * - **Modules** — equipped chassis modules on Inventory tab (rarity, level, stat, main substats).
 * - **Guardians** — chip unlock checkboxes in B10/B13/B16/B19 (TRUE/FALSE); upgrade levels in F2:F19.
 *
 * TowerSmith reads linked IDs from IDS Master, then writes to the linked child workbooks.
 */

/** Workbook name in the IDS Master linked-ID table. */
export const EFFECTIVE_PATHS_LABORATORY_WORKBOOK_NAME = 'Laboratory'

/** Tab title inside the Laboratory workbook (v3.x Master Sheet). */
export const EFFECTIVE_PATHS_LABORATORY_TAB_TITLE = 'Master Sheet'

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

/** Workbook name in the IDS Master linked-ID table. */
export const EFFECTIVE_PATHS_BOTS_WORKBOOK_NAME = 'Bots'

/** Tab title inside the Bots workbook (v3.x Master Sheet). */
export const EFFECTIVE_PATHS_BOTS_TAB_TITLE = 'Master Sheet'

/** Workbook name in the IDS Master linked-ID table. */
export const EFFECTIVE_PATHS_UWS_WORKBOOK_NAME = 'Ultimate Weapons'

/** Tab title inside the UWs workbook (v3.x Master Sheet). */
export const EFFECTIVE_PATHS_UWS_TAB_TITLE = 'Master Sheet'

/** Workbook name in the IDS Master linked-ID table. */
export const EFFECTIVE_PATHS_MODULES_WORKBOOK_NAME = 'Modules'

/** Tab title inside the Modules workbook (v6.x Inventory). */
export const EFFECTIVE_PATHS_MODULES_TAB_TITLE = 'Inventory'

/** Workbook name in the IDS Master linked-ID table. */
export const EFFECTIVE_PATHS_GUARDIANS_WORKBOOK_NAME = 'Guardians'

/** Tab title inside the Guardians workbook (v3.x Master Sheet). */
export const EFFECTIVE_PATHS_GUARDIANS_TAB_TITLE = 'Master Sheet'
