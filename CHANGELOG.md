# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.11] - 2026-06-15

### Added

- **5th Anniversary themes and relics** — Event tower/background skins and relic catalog entries for the anniversary celebration.
- **Google Picker for Effective Paths** — `drive.file` OAuth scope with per-spreadsheet file picker; linked workbook IDs are cached so split-sheet setups reconnect with one picker after the first link.

### Changed

- **Effective Paths Google access** — Replaced full `spreadsheets` scope with `drive.file` plus Picker `setFileIds` so users grant only IDS Master and linked workbooks (supports Google OAuth verification). Requires `VITE_GOOGLE_PICKER_API_KEY` (and optionally `VITE_GOOGLE_CLOUD_PROJECT_NUMBER`).

### Docs

- README: Effective Paths Picker setup and version **3.1.11**.
- What's new banner (en/de/es).

## [3.1.10] - 2026-06-14

### Fixed

- **Effective Paths Workshop export** — `Cells / Kill Bonus +` enhancement rows map to `enhanceCellsKillBonusLevel` (was left unchanged on the preview tab).
- **Effective Paths Themes export** — Shortened **Plasma** labels on tower and background rows map to Plasma Ball / Plasma Field.
- **Effective Paths Relics export** — **Mystic Hair** and **Mystic Hare** map to the Mystic Hare relic; bracket tier suffixes like `[1]` are stripped before matching; unmapped relic exports now show example sheet names.

### Added

- **5th Anniversary relics** — **Big Party** (rare) and **Celebration** (epic) catalog entries and images for Effective Paths sync (unlock text provisional until confirmed in-game).

### Changed

- **Mystic Hair relic display name** — Easter (II) premium relic `mystic_bunny_1` shows **Mystic Hair** in the catalog (was Mystic Bunny[1]).

### Docs

- README: version **3.1.10**.
- What's new banner (en/de/es).

## [3.1.9] - 2026-06-14

### Fixed

- **Assist Module lab import** — All eight Assist Module Substats/Bonus labs map from `researchLevel[230]`–`[237]` so playerInfo.dat import fills those MODULE cards after re-import.
- **Enhancement coin discount lab import** — **Enhancement Attack - Coin Discount** uses slot **154**; **Enhancement Utility - Coin Discount** uses slot **227** (was **136**).

### Changed

- **Music theme previews** — Krisu track art lives under [`public/themes/music/`](public/themes/music/) (with other theme assets).

### Docs

- README: Assist Module and Enhancement `researchLevel` anchors; version **3.1.9**.
- What's new banner (en/de/es).

## [3.1.8] - 2026-06-14

### Added

- **Bug Buster Discord support ticket** — Copies the report and opens the TowerSmith Discord bug-reports channel invite so new and existing members can file a ticket.

### Fixed

- **Mythic+ core module submodule import** — Core chassis rows now remap sparse save indices for Mythic and Mythic+ tiers (same as star/ancestral), fixing wrong substat picks such as Primordial Collapse after playerInfo.dat import.

### Docs

- README: Bug Buster Discord option; version **3.1.8**.
- What's new banner (en/de/es).

## [3.1.7] - 2026-06-14

### Added

- **Renamable card and module preset tabs** — Double-click a preset tab to rename; labels persist in CSV export/import and signed-in account workspace backup.
- **Effective Paths setup guide** — Step-by-step copy in the sync dialog for first-time IDS Master and Google Sheets setup.
- **Privacy Policy link** — Static HTML footer link so Google OAuth verification crawlers can find the policy before the app loads.

### Fixed

- **Bot Bot / Amplify Bot duration lab import** — `researchLevel[213]` maps to Bot Bot - Duration and `[100]` to Amplify Bot - Duration (slots were unmapped, so Bot Bot - Duration always showed Lv.0).

### Changed

- **Google Sheets OAuth** — OAuth `state` parameter for CSRF protection; always prompt Google consent when loading linked workbooks; auth status label always visible on the load button.
- **IDS Master sign-in hint** — Effective Paths sync dialog explains that a cloud-stored IDS Master URL loads after TowerSmith sign-in (or can be pasted locally in Settings).
- **Card preset tab labels** — Default tabs renamed to Preset 1 / Preset 2 (slots 3–5 unchanged).

### Docs

- README: preset rename, OAuth/state, privacy policy, BOTS duration slots; version **3.1.7**.
- What's new banner (en/de/es).

## [3.1.6] - 2026-06-13

### Fixed

- **Dissonant Echo lab import** — `researchLevel[240]` maps to Dissonant Echo - Attack and `[238]` to Utility (IDs were swapped).
- **Shatter Shards / Battle Condition Reduction lab import** — `researchLevel[152]` maps to Shatter Shards; `[199]` maps to Battle Condition Reduction (IDs were swapped).
- **Bot preset import** — Uses purchased medal tiers from `levels[]` instead of the farming slider in `selectedLevels[]`.
- **Effective Paths IDS Collection workbooks** — Detect combined category workbooks and pick the correct tab per area (Laboratory, Workshop, Cards, Modules, Bots, Guardians, Themes, Relics, UWS).

### Docs

- README: extended `researchLevel` anchor table, IDS Collection note, bot preset import behavior; version **3.1.6**.
- What's new banner (en/de/es).

## [3.1.5] - 2026-06-13

### Fixed

- **Reroll Daily Mission lab import** — `researchLevel[148]` (not 151) maps to the Main Research unlock; re-import if Reroll showed unlocked when it was not (or locked when you had bought it).
- **Common Drop Chance lab import** — `researchLevel[134]` maps to the first Modules lab (was wrongly attributed to Enhancement Attack - Coin Discount).
- **Unmerge Module lab import** — `researchLevel[151]` maps to Unmerge Module (was wrongly sharing slot 148 with Reroll).

### Docs

- README: Main/Modules `researchLevel` anchor table; version **3.1.5**.
- What's new banner (en/de/es).

## [3.1.4] - 2026-06-13

### Fixed

- **Golden Bot - Duration lab import** — `researchLevel[108]` (not 109) maps to the Golden Bot - Duration BOTS lab; Thunder Bot - Linger Time uses slot 109. Re-import your save if Golden Duration showed Lv.0 while Thunder Linger looked upgraded.

### Docs

- README: BOTS `researchLevel` slot table for cooldown/duration labs; version **3.1.4**.
- What's new banner (en/de/es).

## [3.1.3] - 2026-06-13

### Fixed

- **Effective Paths Google OAuth** — Consent goes straight to the Google prompt when no cached token (no silent-auth hang). Popup mode on desktop, FedCM on mobile, with automatic UX fallback; `error_callback` fails fast when popups are blocked; progress bar animates during sign-in; clearer timeout message for embedded IDE browsers (e.g. Cursor).
- **OAuth popup delivery** — `Cross-Origin-Opener-Policy: same-origin-allow-popups` on Netlify and Vite dev so Google sign-in can return the access token to the app.

### Docs

- README: Effective Paths OAuth troubleshooting (Chrome/Firefox, popups, embedded browsers); version **3.1.3**.
- What's new banner (en/de/es).

## [3.1.2] - 2026-06-13

### Added

- **Save IDS button** — Tools / Settings → Effective Paths: explicit **Save IDS** control writes local storage and your Supabase profile when signed in.
- **IDS on Supabase profiles** — `profiles.effective_paths_ids_master_ref` is the primary cross-device store for the IDS Master URL; legacy workspace-backup values migrate on sign-in.

### Fixed

- **IDS cross-device sync** — Profile hydration on sign-in, legacy workspace backup migration, and settings UI refresh when the cloud value arrives.
- **Import Save** — Button label clarified; file picker restricted to `.dat` saves.
- **CI / Netlify build** — ESLint and TypeScript fixes for the IDS settings hook.

### Docs

- README: Save IDS flow, profile column, account workspace function, Supabase upgrade note; version **3.1.2**.
- What's new banner (en/de/es).

## [3.1.1] - 2026-06-13

### Added

- **Effective Paths IDS Master per account** — The IDS Master spreadsheet URL/ID in Tools / Settings is stored per signed-in user and synced with account workspace backup (Supabase Storage JSON), so it follows you across devices. Pre-login entries migrate on first sign-in.

### Fixed

- **Effective Paths Google OAuth** — GIS script load no longer hangs on retry when the Google client is already on the page; stalled consent now times out with a clear error instead of an infinite progress bar.
- **Account workspace sync** — More reliable Supabase access-token refresh on fetch/save; fewer spurious 401s and sign-out loops during cloud sync.

### Docs

- README: Effective Paths IDS storage and account persistence; version **3.1.1**.
- What's new banner (en/de/es).

## [3.1.0] - 2026-06-13

### Added

- **Guardians tab** — Chip loadout (four slots, six chip types, Bits unlock costs), GOD tables under `tables/guardians/`, save import via `gameGuardianChipMapping.ts`, and `guardian,state` tower CSV row.
- **Effective Paths sync** — Google Sheets import/export for IDS Master linked workbooks (Laboratory, Workshop, UWs, Cards, Modules, Bots, Guardians, Themes, Relics); staged export preview tabs; Netlify Functions + OAuth client ID.
- **Vault tab** — Placeholder shell for future vault tooling.
- **Tower CSV extensions** — `lab,gameResearchLevel` (full save research array), `theme,selection` (active skin picks), guardian chip state row.
- **Gallery** — Twitch OAuth; owner category/visibility controls, upvotes, share-link regeneration; guild name registry and gallery filters.

### Fixed

- **Netlify build** — TypeScript fix for Effective Paths pending export target set; ESLint clean pass.

### Docs

- README: Guardians, Vault, Effective Paths sync, expanded tower CSV row table, Netlify Functions overview, player-save mapping, maintainer `docs/` workflow, keyboard shortcuts `1`–`0`, Twitch auth.
- Keyboard shortcut i18n: tab `9` = Vault, tab `0` = Gallery.
- README: version **3.1.0**.
- What's new banner (en/de/es).

## [3.0.8] - 2026-06-10

### Fixed

- **Module submodule import** — Ancestral and star-tier chassis and assist modules (e.g. Orbital Augment, Dimension Core, Primordial Collapse) decode sparse save effect indices to the correct in-game substat picks.
- **Assist module picker** — Submodule slot levels, scaled values, and display formatting (degrees, seconds, land-mine stats, generator ancestral tiers) match in-game lines after save import.
- **Swamp Rend ultimate labs** — `researchLevel` slots 156–157 map to Swamp Rend and Swamp Rend+.

### Changed

- Workshop state tracks main and assist chassis module levels separately.

### Docs

- README: version **3.0.8**.
- What's new banner (en/de/es).

## [3.0.7] - 2026-06-09

### Fixed

- **Golden Tower Golden Combo (Ultimate Plus)** — Track extended to wiki level 14 (0.45% bonus); was capped at level 10 (0.33%). Per-ability max level now follows each Plus track’s milestone table.

### Docs

- README: version **3.0.7**.
- What's new banner (en/de/es).

## [3.0.6] - 2026-06-09

### Fixed

- **Assist substat scaling** — Combined sub-stone efficiency (70%) plus Assist Module Substats lab (30%) can reach 100%, but assist substat bonuses were clamped at the 70% stone cap. Ultimate weapon and workshop displays now apply the full SE lab bonus (e.g. Poison Swamp cooldown/duration with max assist core substats).

### Docs

- README: version **3.0.6**.
- What's new banner (en/de/es).

## [3.0.5] - 2026-06-08

### Added

- **Workshop GOD tables** — Stat values and marginal upgrade coins from `tables/workshop/` ([`workshopGodTables.ts`](src/data/workshopGodTables.ts), [`workshopCosts.ts`](src/workshopCosts.ts)); removed legacy wiki ladder modules superseded by GOD JSON.
- **Lab GOD refresh** — Regenerated lab cost/value tables from lab-calculator TSV scrape (`node scripts/sync-lab-god-tables.mjs`).
- **Volcano (IV) relics** — New relic group entries and unlock mapping.
- **Workshop display calibration** — Save-backed pipeline tests for utility cards (free upgrades, interest/wave, coins rows, recovery amount, max recovery).

### Fixed

- **Workshop card displays** — Attack (Damage, DPM, Damage/Meter relics), defense (Health, regen, wall health, land mine, etc.), and utility rows now match in-game stacking: labs, cards, relics, sub-modules, and enhancement tiers including **Recovery Package+** on Recovery Amount and Max Recovery ([`workshopUtility.ts`](src/data/workshopUtility.ts), [`workshopDefense.ts`](src/data/workshopDefense.ts), [`workshopDamage.ts`](src/data/workshopDamage.ts)).
- **Coin abbreviations** — Unified **T** below 1 q and **q** from 1e15 app-wide ([`labCosts.ts`](src/labCosts.ts)).
- **Lab coin import** — Uppercase **Q** in scraped values means quintillion (1e18), not quadrillion.
- **Viral Outbreak (III)** — Correct relic unlock display names.
- **Guild names** — Registered guild members can correct the guild name on file.

### Changed

- Removed the lab screenshot transcription pipeline (replaced by TSV scrape import).

### Docs

- README: workshop GOD tables and displayed-stat coverage; version **3.0.5**.
- What's new banner (en/de/es).

## [3.0.4] - 2026-06-08

### Added

- **Workshop MAX buy multiplier** — **MAX** chip on upgrade and enhance rails: **+** jumps to the stat cap, **−** resets to 0; next-cost shows the total to max ([`workshopBulkMarginal.ts`](src/data/workshopBulkMarginal.ts), [`WorkshopPage.tsx`](src/components/WorkshopPage.tsx)).
- **Lab GOD tables** — cost/value JSON under `tables/labs/` (authoritative ground truth), wired through [`labGodTables.ts`](src/data/labGodTables.ts). Refresh imports with `node scripts/sync-lab-god-tables.mjs`.
- **researchLevel import** — Complete `researchLevel` slot → lab mappings from player save evidence (card mastery, ultimates, battle condition, modules, and related trees).

### Fixed

- **Bug Buster dialog** — No longer clips on 1080p viewports.
- **Tower Backup dialog** — Removed unnecessary scrollbar.
- **Profile avatar** — Removing a custom avatar no longer falls back to the Google OAuth picture.

### Changed

- Browser tab title: **TowerSmith**.

### Docs

- README: `tables/` GOD data, workshop **MAX** multiplier, `researchLevel` import; version **3.0.4**.
- [`src/playerSave/NOTICE.md`](src/playerSave/NOTICE.md): `researchLevel` mapping index.
- What's new banner (en/de/es).

## [3.0.3] - 2026-06-03

### Fixed

- **Legacy bot save import** — Older `playerInfo.dat` files store medal bots in `botsUnlockedPresets`, `botsActivePresets`, and `botsLevelPresets` / `botsLevelSelectionPresets` instead of per-bot `*BotPresets` lists. Import now hydrates the Bots tab from the active preset row ([`gameBotLegacyPresetMapping.ts`](src/playerSave/gameBotLegacyPresetMapping.ts)).
- **Bug Buster email** — `mailto:` subject and body use `%20` for spaces (not `+`), so Outlook and similar clients no longer show plus signs. **Email support** also copies clean text to the clipboard before opening the mail client.

### Docs

- README and [`src/playerSave/NOTICE.md`](src/playerSave/NOTICE.md): legacy bot preset arrays; version **3.0.3**.
- What's new banner (en/de/es): legacy bot import and email report fixes.

## [3.0.2] - 2026-06-02

### Fixed

- **All bot save imports** — Every `UserBotData.levels[]` uses `[cooldown, range, weaponStat2, weaponStat4]`, not workshop UI row order. v3.0.1 fixed Golden Bot only; Flame, Thunder, Amplify, and Bot Bot now use the same layout ([`gameBotPresetMapping.ts`](src/playerSave/gameBotPresetMapping.ts)).
- **Lab coin display** — Assist Module labs use wiki **q** scale (e.g. **250.00q**, not **T**). Other labs use **T** below 1 q (1e15) and **q** from 1e15 up (e.g. Ultimate Weapon Durations **2.00q**, not **2000.00T**) via [`formatAssistModuleLabCoinDisplay`](src/labCosts.ts) / [`formatLabCoinDisplay`](src/labCosts.ts).
- **Cannon module import** — Map game `infoIndex` **41** to **Shrink Ray** so equipped cannon chassis name/icon import correctly (sub-stats were already decoded from `effects`).
- **Gallery admin** — Admin list now requests all builds (public and private/unlisted) with your admin token; previously it used the anonymous public-only gallery query.

### Docs

- README: **Lab coin display** section (Assist Module **q** vs other labs **T**/**q**); module `infoIndex` and `gen-game-module-index.mjs`; **Gallery admin**; version **3.0.2**.
- `.env.example`: `TOWER_GALLERY_ADMIN_USER_IDS` comment.
- What's new banner (en/de/es): Assist Module lab costs use **q**.

## [3.0.1] - 2026-06-02

### Fixed

- **Golden Bot save import** — `playerInfo.dat` import mapped **Bonus** and **Range** medal levels from the wrong preset indices; Golden Bot save order is `[cooldown, range, bonus, duration]` (not the same as Amplify Bot). Workshop stats now match in-game values after import ([`gameBotPresetMapping.ts`](src/playerSave/gameBotPresetMapping.ts)).

### Docs

- README: Golden Bot preset `levels[]` index order under `src/playerSave/`; version **3.0.1**.

## [3.0.0] - 2026-06-02

### Added

- **playerInfo.dat import** — LAB tab imports gzip-compressed BinaryFormatter saves from The Tower: lab levels, workshop, bots, ultimates, modules, card stars/presets, relic ownership, and owned cosmetic themes ([`importPlayerInfo.ts`](src/playerSave/importPlayerInfo.ts), [`mapPlayerDataToTower.ts`](src/playerSave/mapPlayerDataToTower.ts)). Android path hints copy the save folder to the clipboard.
- **Appearance themes** — Dark (default), Light, and High contrast color schemes in Tools / Settings, with early boot in [`public/color-scheme-boot.js`](public/color-scheme-boot.js) to avoid theme flash.
- **Deep links** — URL hash or query navigation to lab cards (`?lab=…`), workshop stats (`?workshop=…`), and relics (`?relic=…`) ([`appDeepLink.ts`](src/appDeepLink.ts)).
- **Keyboard shortcuts & undo** — `/` search focus, `1`–`8` main tabs, `Ctrl+Z` workspace undo (20 steps), `Esc` closes dialogs; documented under Tools / Settings.
- **PWA** — Service worker and install guidance for Add to Home Screen ([`vite-plugin-pwa`](package.json)).
- **First-run hints** — In-app onboarding callout for import and community builds.
- **Panel error boundaries** — Isolated crash recovery per main tab with reload and copy-details actions.
- **CI** — GitHub Actions: `check:i18n`, lint, Vitest, build, and Playwright e2e (`.github/workflows/ci.yml`).

### Changed

- **Gallery discoverability** — Setup callouts and category filters when Supabase is not configured or gallery is disabled.
- **Performance** — Lazy-loaded main panels; community build row restored on all tabs.
- **Production research cache** — Stale-while-revalidate via service worker; manual refresh in Tools / Settings.

### Fixed

- **Gallery publish** — Access-token refresh, Supabase project mismatch detection, and clearer sign-in / session errors when submitting builds.

### Docs

- README: reorganized features, player save import, appearance, deep links, keyboard shortcuts, maintainer `docs/` folder, save-mapping scripts, CI, Supabase env alignment note, and expanded npm script table.

## [2.8.11] - 2026-05-26

### Added

- **Sub-module workshop bonuses** — Equipped main and assist sub-module picks add to workshop stat labels (attack, defense, utility, ultimate core stats) via [`workshopSubmoduleBonuses.ts`](src/data/workshopSubmoduleBonuses.ts) and [`workshopSubmoduleWorkshopDisplay.ts`](src/data/workshopSubmoduleWorkshopDisplay.ts).
- **Assist sub-module scaling** — Assist picks scale by sub stone efficiency plus Assist Module Substats labs; integer stats floor to whole values, attack-speed scales proportionally ([`workshopAssistSubmoduleScale.ts`](src/data/workshopAssistSubmoduleScale.ts)).

### Changed

- **Submodule selections** — `simSubmoduleSelections` stores nested `main` / `assist` maps per chassis slot; legacy flat maps migrate on load ([`workshopSubmoduleSelection.ts`](src/data/workshopSubmoduleSelection.ts)).
- **Workshop stat cards** — Multishot, rapid fire, bounce shot, crit factor, attack range, damage/meter, super crit, rend armor, defense, and utility cards include sub-module terms alongside relic and lab bonuses.
- **Module picker** — Options dropdown hides sub-effects already assigned on the current main or assist row ([`ChassisModulePickerDialog.tsx`](src/components/ChassisModulePickerDialog.tsx)).

### Docs

- README: sub-module workshop sim, main/assist selection maps; version **2.8.11**.

## [2.8.10] - 2026-05-26

### Fixed

- **Viral Outbreak relic unlocks** — All eight event relics (Bacteriophage, Rabies, Neuron, Ebola, Viral Infection, Immunization, Personal Care, Global Threat) use wiki event names (`Viral Outbreak` / `Viral Outbreak (II)`) instead of `Viral Outbreak (III)` on the four newest entries ([`patch-relics-catalog.mjs`](scripts/patch-relics-catalog.mjs)).

### Changed

- **`patch-relics-catalog.mjs`** — Viral Outbreak patch block for the full eight-relic set; `newRelics` append skips ids already in the catalog.

### Docs

- README version **2.8.10**.

## [2.8.9] - 2026-05-26

### Added

- **Viral Outbreak relics** — **Viral Infection**, **Immunization**, **Personal Care**, and **Global Threat** (event set; **268** relics total).
- **Relic art by rarity** — WebP files under `public/relics/rare/`, `epic/`, `legendary/`, and `unmapped/`; image map paths include the subfolder ([`sort-relics-by-rarity.mjs`](scripts/sort-relics-by-rarity.mjs), [`gen-relic-images.mjs`](scripts/gen-relic-images.mjs)).
- **Relic workshop bonuses** — Owned relics apply parsed stat bonuses to displayed damage, health, lab speed, bot range, and related workshop formulas ([`workshopRelicWorkshopDisplay.ts`](src/data/workshopRelicWorkshopDisplay.ts), [`workshopRelicStats.ts`](src/data/workshopRelicStats.ts)).
- **Relic workshop bonus lines** — Optional per-card workshop bonus text on the Relics tab (toggle in **Tools / Settings**, [`relicWorkshopBonusLinesVisibility.ts`](src/relicWorkshopBonusLinesVisibility.ts)).

### Changed

- **Displayed damage relic term** — `simRelicsBonusFraction` sums owned **damage** and **damage/meter** relic effects from descriptions instead of catalog `damagePct` only.

### Docs

- README: **268** relics, rarity subfolders, relic workshop sim, maintainer scripts; version **2.8.9**.

## [2.8.8] - 2026-05-25

### Fixed

- **Tower Master relic art** — Tournament relic **Tower Master** now uses `relic_ChampionFirst_1.webp` instead of the **Tower Agent** event icon ([`gen-relic-images.mjs`](scripts/gen-relic-images.mjs)).

### Docs

- README version **2.8.8**.

## [2.8.7] - 2026-05-25

### Added

- **Guild Season 9 relics** — **Magic Cards** (rare) and **Dangerous Tricks** (epic) in the relic catalog with WebP art ([`workshopRelics.generated.json`](src/data/workshopRelics.generated.json), [`patch-relics-catalog.mjs`](scripts/patch-relics-catalog.mjs)).
- **Music theme previews** — Krisu track cards on the Themes **Music** tab use in-game note art ([`public/music/`](public/music/), [`gameThemes.ts`](src/data/gameThemes.ts)).

### Docs

- README: **264** relics, music preview art, `public/music/`; version **2.8.7**.

## [2.8.6] - 2026-05-25

### Added

- **Relic art** — WebP icons for all **262** catalog relics on the Relics tab ([`workshopRelicImages.ts`](src/data/workshopRelicImages.ts), [`public/relics/`](public/relics/)); maintainer scripts [`gen-relic-images.mjs`](scripts/gen-relic-images.mjs) and [`rename-relic-files.mjs`](scripts/rename-relic-files.mjs).
- **Theme skins** — Rabbit In Hat tower skin, Magician event background/menu/banner, and Shelly / Disco guardians ([`gameThemes.ts`](src/data/gameThemes.ts), [`towerMilestoneImages.ts`](src/data/towerMilestoneImages.ts)).
- **Relic display names** — Title-case formatting for relic names at load time ([`relicDisplayName.ts`](src/data/relicDisplayName.ts)).

### Changed

- **Game-aligned asset refresh** — Theme, bot, ultimate weapon, and chassis module WebP paths updated to match in-game export filenames; workshop tab icons use sword/shield/star/ultimate glyphs ([`workshopModuleImages.ts`](src/data/workshopModuleImages.ts), [`ThemeIcon.tsx`](src/components/ThemeIcon.tsx)).
- **Dedicated module art** — Shrink Ray, Magnetic Hook, Primordial Collapse, and other chassis modules now use dedicated icons instead of rarity placeholders.

### Docs

- README: relic WebP art, `public/relics/`, maintainer scripts; version **2.8.6**.

## [2.8.5] - 2026-05-25

### Added

- **Max All** — Toolbar button on **Workshop** (current category/tab, respects hide completed), **Lab** (visible coin labs: search, hide completed, expanded sections), **Cards** (all card stars to max), and **Bots** (own all bots, max basic upgrades and Bot+ levels) ([`applyWorkshopMaxAllVisible`](src/workshopBudgetAggregates.ts), [`maxVisibleLabLevels`](src/labBudgetAggregates.ts), [`maxWorkshopCardStars`](src/labPresetsStorage.ts), [`maxWorkshopBots`](src/labPresetsStorage.ts)).

### Changed

- **Bots toolbar** — Removed **Hide Completed** toggle; all five bots are always listed on the Bots panel.

### Docs

- README: **Max All** on workshop, lab, cards, and bots; version **2.8.5**.

## [2.8.4] - 2026-05-22

### Fixed

- **Workshop card stars** — Loading saves with unified `cardStars` no longer zeroes stars when legacy sim mirror fields are `0` (unequipped preset) ([`workshopCardStarsFromLegacy`](src/data/workshopGameCards.ts)).
- **Research benefit lines** — Labs whose wiki Lv.0 value is **—** show the first-tier benefit at Lv.0 instead of `— » …` ([`benefitLineWithNextUpgrade`](src/types/research.ts)).

### Changed

- **Workshop card star steppers** — At max stars the input shows localized **Max**; typing `max` (or the locale label) commits to max ([`WorkshopCardsPanel`](src/components/WorkshopCardsPanel.tsx)).
- **Enhance unlock hints** — Coin spend gates display wiki-style **T** abbreviations through quintillion scale (`formatCoinAbbrevPreferT` in [`labCosts.ts`](src/labCosts.ts); attack/defense/utility enhance panels).

### Docs

- README: card star **Max** stepper, enhance **T** hints, research Lv.0 benefit display; version **2.8.4**.

## [2.8.3] - 2026-05-21

### Added

- **Full app reset** — **Tools / Settings** button with confirmation clears every `tower-export-*` `localStorage` key and reloads the app ([`fullResetStorage`](src/fullResetStorage.ts), [`ToolsPage`](src/components/ToolsPage.tsx)).

### Changed

- **Assist module slots** — Slots default to **locked** until purchased for **1,000** power stones; unlock cards match bot/ultimate weapon unlock UI; hub module picker disabled until unlocked ([`workshopAssistChassisModule`](src/data/workshopAssistChassisModule.ts), [`AssistUnlocksPanel`](src/components/AssistUnlocksPanel.tsx), [`WorkshopModulesPanel`](src/components/WorkshopModulesPanel.tsx)).
- **Assist unlock layout** — Modules-panel CSS keeps unlock row height compact, prevents stretch/collapse, and keeps card headers the same height on locked and unlocked cards (hidden toggle placeholder).

### Docs

- README: assist slot locking, full reset; version **2.8.3**.

## [2.8.2] - 2026-05-21

### Added

- **Module merge tiers** — Full wiki max-level table (Rare 30 … 5★ 300) for chassis modules: 14 merge tiers in the module picker, level clamping per tier, and persistence on workshop presets ([`workshopChassisModuleShared`](src/data/workshopChassisModuleShared.ts), [`ChassisModulePickerDialog`](src/components/ChassisModulePickerDialog.tsx)).

### Fixed

- **Modules panel crash** — Resolve effect-tier values when displaying equipped modules at merge tiers such as Epic+ or 5★ (fixes white screen on Workshop/Modules).
- **Legacy saves** — `ancestral` rarity with module level above 200 coerces to 5★ on load (planner previously treated Ancestral as max 300).

### Changed

- **Assist unlocks** — Removed redundant hint under Assist unlocks cards.

### Docs

- README: version **2.8.2**.

## [2.8.1] - 2026-05-20

### Added

- **Bots + BOTS labs** — Simulated **BOTS** research levels now adjust bot stat values on the **Bots** panel (cooldown −1s/level, duration +0.5s/level, Thunder **Linger** +3% + 0.5%/level combined into one percent display). Wired via [`buildWorkshopBotLabDisplayOpts`](src/data/workshopLabDisplayOpts.ts), [`botsResearch*`](src/types/research.ts), and lab overrides from the Lab tab ([`BotsPage`](src/components/BotsPage.tsx)).

### Docs

- README: BOTS lab integration on the Bots panel; version **2.8.1**.

## [2.8.0] - 2026-05-19

### Added

- **Bots panel** — Top-level **Bots** navigation with five event-shop bots (Flame, Thunder, Golden, Amplify, Bot Bot): medal unlock costs, per-stat upgrade tracks, ON/OFF toggles, and wiki-aligned **Bot+** abilities after a **1,250** power-stone purchase when all five bots are owned ([`BotsPage`](src/components/BotsPage.tsx), [`WorkshopBotCard`](src/components/WorkshopBotCard.tsx), [`WorkshopBotSpecialCard`](src/components/WorkshopBotSpecialCard.tsx), [`workshopBots`](src/data/workshopBots.ts), [`workshopBotsData.ts`](src/data/workshopBotsData.ts); generator [`scripts/gen-workshop-bots-data.mjs`](scripts/gen-workshop-bots-data.mjs)).
- **Bot+ medal upgrades** — Per-ability level tracks and marginal medal costs from wiki Events tables (Burning Ground, Titan Shock, Bonus Cells tier-2 curve, Echoing Shot, Maximum Power flat curve); stone purchase vs medal level persisted separately (`workshopBotSpecialStonePurchased`, `*Level` keys, legacy `*Unlocked` migration).
- **Bot CSV backup** — Tower CSV `ws` rows round-trip bot stat levels, owned/active flags, Bot+ purchase flags, and Bot+ levels ([`towerUnifiedCsv.ts`](src/towerUnifiedCsv.ts)).

### Changed

- **Golden / Amplify / Bot Bot basic upgrades** — Wiki level caps and medal totals (e.g. bonus to level 30, range caps at 18 or 20); Bot Bot bonus curve ×1.0–×2.5.
- **Duration and cooldown display** — Workshop **Bots** and **Ultimate Weapons** show times in seconds only (e.g. `75s`, `200s`, `20.5s`), not `1m 15s` ([`formatWorkshopUltimateCooldown`](src/data/workshopUltimateTable.ts), [`workshopBotStatDisplay`](src/data/workshopBots.ts)).
- **Bot bonus display** — Bot stat **Bonus** multipliers use two decimal places (e.g. `x1.05`, `x15.50`).

### Docs

- README: Bots panel, Bot+ persistence, tower CSV bot `ws` fields, `gen-workshop-bots-data.mjs`; version **2.8.0**.

## [2.7.3] - 2026-05-19

### Fixed

- **Chassis module picker — unique effect text** — Tier values no longer render with duplicated suffixes (`%%`, `××`) when the wiki template already includes `%` or `×` and the formatter adds them again (generator, core, cannon, armor catalogs).
- **Chassis module picker — value highlight** — Plain count tier values (e.g. Being Annihilator “next **3** attacks”) are highlighted like `%`, `s`, and `×` values.
- **Assist modules** — Unique-effect rarity is separate from the equipped module’s merge tier in the picker and hub; main and assist cannot equip the same module (pickers exclude the other slot; conflicting selections clear on load).

### Docs

- README version **2.7.3**.

## [2.7.2] - 2026-05-19

### Changed

- **Modules hub — assist slots** — When an assist module is equipped, show **Eff. {main}% / {sub}%** under the module name (matches unlock-panel stone efficiency). Hidden when no assist module is selected.
- **Assist unlock cards** — Slot icon uses the same rarity color class as the Unique column.

### Docs

- README version **2.7.2**.

## [2.7.1] - 2026-05-19

### Fixed

- **Dissonant Echo labs** — Research card benefit lines match the wiki **Value** column: **0.50% × (lab level + 1)** (Lv.0→`0.50% » 1.00%`, Lv.3→`2.00% » 2.50%`, Lv.19→`10.00% » 10.50%`, Lv.20→`10.50%`). See `dissonantEchoBoostChancePercentValue` in [`research.ts`](src/types/research.ts).

### Docs

- README: Dissonant Echo value formula note; version **2.7.1**.

## [2.7.0] - 2026-05-19

### Added

- **Ultimate Weapon Plus** — Nine wiki secondary abilities (Smite, Cover Fire, Death Creep, …) with ordered unlock costs and upgrade tracks on each ultimate weapon card ([`workshopUltimatePlus`](src/data/workshopUltimatePlus.ts), [`workshopUltimatePlusData.ts`](src/data/workshopUltimatePlusData.ts), `WorkshopUltimatePlusAbilityCard`). Vitest coverage for unlock order and stone totals.
- **Assist chassis modules** — Per-slot assist unlocks, unique rarity upgrades, main/sub stone efficiency (1–70%), and equipped assist chassis modules on the **Modules** hub ([`workshopAssistChassisModule`](src/data/workshopAssistChassisModule.ts), `AssistUnlocksPanel`). Tower CSV `ws` rows round-trip assist fields.
- **Assist module wiki reference** — Optional stone-efficiency and unique-rarity tables on the Modules tab (`AssistModuleReference`); toggle in **Tools / Settings** (`assistModuleCatalogVisibility`).
- **Workshop stone budgets** — Ultimate tab budget panel uses power-stone rollups (basic upgrades, weapon unlocks, Plus unlocks/upgrades) via [`workshopBudgetAggregates.ts`](src/workshopBudgetAggregates.ts).
- **Spanish UI strings** — Split to [`dictionary.es.ts`](src/i18n/dictionary.es.ts) (same pattern as German).

### Changed

- **Cards stat overlay** — Scaled star effect always shows on card art; removed the Settings toggle and `cardsStatOverlayVisibility` storage.
- **Lab costs** — Additional lab name aliases; `formatPowerStoneAmount` for stone display.

### Docs

- README: Ultimate Plus, assist chassis, stone budgets, assist wiki toggle, `dictionary.es.ts`, tower CSV assist/Plus fields, maintenance scripts; version **2.7.0**.

## [2.6.3] - 2026-05-18

### Added

- **German (`de`) locale** — Full UI copy in [`src/i18n/dictionary.de.ts`](src/i18n/dictionary.de.ts), research name overlay ([`research-overlay.de.json`](src/i18n/research-overlay.de.json)), and benefit-line translation. Choose **Deutsch** in Settings or the Lab header language menu. Regenerate the research overlay with `node scripts/write-research-overlay-de.mjs`.
- **Relics search** — Filter the relic catalog by name, description, or unlock text; press `/` on the Relics tab to focus the search field.
- **Themes search** — Same search pattern on the Themes tab (name, event, unlock metadata).

### Changed

- **Relics catalog** — Wiki-aligned corrections and full **262-relic** table in [`workshopRelics.generated.json`](src/data/workshopRelics.generated.json) (`scripts/patch-relics-catalog.mjs`).

### Fixed

- **Relics / Themes toolbars** — Correct spacing between reset actions and search inputs in the in-panel workshop toolbar slot.
- **Relics layout** — Remove double margin between the relic bonuses summary and filter tabs.

### Docs

- README: German locale, overlay scripts, Relics/Themes search, version **2.6.3**.

## [2.6.2] - 2026-05-18

### Fixed

- **Workshop Enhancements**: Attack, defense, and utility enhancement cards stay locked until **Workshop Enhancements** is researched in Main Research (Lv.≥1). Per-stat coin-spend unlock gates apply only after that lab unlock. Displayed damage and attack speed omit enhancement multipliers until the lab is researched; budget “next upgrade” sums respect the same gate.

### Added

- **`workshopEnhanceResearch.ts`**: Helpers for simulated Main Research **Workshop Enhancements** level; Vitest coverage.

### Docs

- README: note Main Research lab gate on the Enhance tab.

## [2.6.1] - 2026-05-18

### Fixed

- **Cards (mobile)**: Inventory stays **4 per row** (removed 2-column squeeze); preset toolbars on Cards and Modules use a **5-column grid** without horizontal scrollbars (`container-type` on `modules-layout`).
- **Workshop (mobile)**: Category icons stay inside attack/defense/utility/ultimate buttons (no `scale(3)` overflow).
- **Relics (mobile)**: Filter tabs use a **3×2 grid** with full labels (no ellipsis on MILESTONE / TOURNAMENT).

### Changed

- **Dev server**: `vite.config.ts` sets `server.host: true` for LAN testing from other devices.

### Docs

- README: note LAN **Network** URL when running `npm run dev`.

## [2.6.0] - 2026-05-18

### Fixed

- **Ultimate weapon basic upgrades (wiki alignment)** — Milestone values and power-stone costs for all nine ultimates; corrections include:
  - **Chain Lightning**: ×3990 damage tier; quantity **1#–5#** (removed extra tier); **18,375** stones total.
  - **Inner Land Mines**: damage curve **×10–×3021** (was wrong multiplier ladder); **13,522** stones.
  - **Poison Swamp**: damage **×10–×3021** with wiki costs; duration **30s–100s**; third track is **cooldown** (**125s–50s**, not chance %) — persist key `poisonSwampCooldownLevel` with migration from `poisonSwampChanceLevel`; **19,196** stones.
  - **Spotlight**: angle **76°–90°** (15 missing tiers); **42,236** stones.
- **Death Wave** (from 2.5.2): max damage tier stones, cooldown to **50s**; **29,391** stones.

### Added

- **Tests**: Vitest wiki total spot-checks for every ultimate weapon basic-upgrade track (`workshopUltimate.test.ts`).

### Changed

- **Persistence**: `labPresetsStorage` migrates legacy `poisonSwampChanceLevel` → `poisonSwampCooldownLevel` on load.

### Docs

- README: ultimate-weapon wiki tables note; `gen-workshop-ultimate-data.mjs` script description.

## [2.5.2] - 2026-05-18

### Fixed

- **Death Wave basic upgrades**: Wiki-aligned damage max tier stone cost (×9119), five missing cooldown tiers down to **50s**, and stone totals (**17,591** / **2,950** / **8,850** → **29,391**).

### Changed

- **PWA maskable icon**: `icon-maskable-512.png` uses the W3C safe zone (80% scale on `#0B1220`); `render-app-icon-png.mjs` / `generate-app-icons.mjs`.

## [2.5.1] - 2026-05-18

### Added

- **Cards stat overlay**: Optional badge on card art for the scaled star effect (× Card Mastery); toggle in **Tools / Settings** (`cardsStatOverlayVisibility`, `WorkshopCardsPanel`).

### Changed

- **i18n**: EN/ES strings for the cards stat overlay setting.

## [2.5.0] - 2026-05-18

### Added

- **TowerSmith** rebrand: browser title, PWA manifest, Open Graph / Twitter previews, OG banner, and in-app copy; GitHub repository **AngryBrit/tower-smith**.
- **Module loadout presets**: five saved hub configurations (levels, chassis, assist, sub-modules) on the **Modules** tab (`workshopModulePresets`, `WorkshopModulesPanel`).
- **GitHub Sponsors** footer link (`FUNDING.yml`, `appVersion` sponsor URL).

### Changed

- **Modules hub**: polished slot layout, generator connector alignment, and assist positioning with efficiency display (`WorkshopModulesPanel`, `App.css`).

### Docs

- README tower CSV format, share v4, and module-preset persistence notes; expanded OG/PWA/meta descriptions; corrected CHANGELOG 2.3.0 theme/share rows; release template links.

## [2.4.2] - 2026-05-18

### Changed

- **Branding**: App display name is **TowerSmith** (browser title, PWA manifest, Open Graph / Twitter previews, OG banner, and in-app copy). Replaces the previous **The Armoury** / **The Forge** names.
- **Chassis module levels**: Wiki-aligned per-rarity level caps (Epic 60, Legendary 100, Mythic 140, Ancestral 300); picker clamps on rarity change and shows the correct max in the level control (`workshopChassisModuleMaxLevel`, `clampWorkshopChassisModuleLevel`).
- **Sub-module slots**: Eight effect slots with unlock gates at Lv. 1, 1, 41, 101, 141, 161, 201, and 241; slots above the current rarity max show a dedicated locked state in the module picker.
- **i18n**: EN/ES copy for sub-module slots blocked by rarity max level.

### Added

- **Module loadout presets**: Five module configurations (hub levels, chassis, assist, sub-modules) on the **Modules** tab, persisted with the workshop snapshot (`workshopModulePresets`, `WorkshopModulesPanel`).
- **Tests**: Vitest coverage for rarity level caps and clamping (`workshopChassisModuleShared.test.ts`) and module preset select/snapshot round-trip (`workshopModulePresets.test.ts`).

## [2.4.1] - 2026-05-17

### Changed

- **Share codec v4-only**: `?tower=` payloads use a single `LabsShareFile` shape (`v: 4`); theme data in links carries **owned catalog IDs** only (active skin selection is not encoded).
- **Import/compare**: Lab compare and file import accept **tower CSV** (`tower_csv_v1`) and share payloads only; legacy `key,level` CSV and `?labs=` URLs are no longer parsed.
- **Theme apply**: `TowerThemesSnapshot.selection` is optional so CSV/share imports can update owned skins without overwriting the current selection.
- **Modules UI**: Chassis module picker and workshop modules panel layout tweaks.

### Removed

- Share codec versions **v1–v3** and the legacy **`?labs=`** query parameter.

## [2.4.0] - 2026-05-17

### Added

- **Relics tab**: Top-level **Relics** navigation with owned-catalog toggles, displayed-damage relic bonus, toolbar reset, and wiki-aligned stat rollups (`RelicsPage`, `WorkshopRelicsPanel`, `workshopRelics`, `workshopRelicStats`).
- **Chassis modules**: Cannon, armor, core, and generator module catalogs with epic→ancestral tier tables, ability text, and WebP art under `public/modules/` (`workshopCannonModules`, `workshopArmorModules`, `workshopCoreModules`, `workshopGeneratorModules`, `workshopChassisModuleShared`).
- **Module UX**: Equip picker dialog, browsable chassis catalog, and submodule-effects reference (`ChassisModulePickerDialog`, `ChassisModulesCatalog`, `SubmoduleEffectsCatalog`); assist chassis selection with hero-stat readout (`workshopAssistChassisModule`, `workshopChassisModuleHeroStat`).
- **Submodule picks**: Per-slot cannon sub-module effect selections wired into attack-speed sim (`workshopSubmoduleSelection`, `workshopSubmoduleCatalog`).
- **Module art helpers**: Rarity frame sprites and per-module image paths (`workshopModuleArt`, `workshopModuleImages`).
- **Resets**: Separate **reset modules** and **reset relics** flows that preserve other workshop, card, and theme state (`resetWorkshopModules`, `resetWorkshopRelics`).
- **Unified CSV**: Workshop rows for `relicOwnedIds`, equipped chassis module ids, assist chassis, and `simSubmoduleSelections` round-trip in tower CSV import/export.
- **Tests**: Vitest coverage for chassis catalogs, submodule selection, relic stats, module images, assist chassis, and sim-module merges.

### Changed

- **Modules page & panel**: Expanded `ModulesPage` and `WorkshopModulesPanel` for chassis equip, assist levels, submodule picks, and catalog visibility toggles (`modulesCatalogVisibility`, `submodulesCatalogVisibility`).
- **Displayed stats**: Chassis modules, relic bonus, and submodule attack-speed effects fold into workshop sim and compare paths (`workshopSimModules`, `workshopCompare`).
- **Persistence**: `WorkshopPersistedV1` adds relic ownership, chassis equip fields, assist chassis, and submodule selections; presets and compare import apply the expanded snapshot.
- **i18n**: EN/ES strings for Relics navigation, module catalogs, chassis picker, submodule effects, and reset affordances.

## [2.3.0] - 2026-05-17

### Added

- **Themes tab**: Dedicated in-panel **Themes** navigation with tower, background, music, menus, banners, and guardian categories; coin-bonus summary, owned catalog, selection per category, and reset (`ThemesPage`, `gameThemes.ts`).
- **Theme catalog & art**: Event and guild tower skins, background events, menu guild seasons, banner guild rows, and guardian entries with WebP previews under `public/themes/` (`towerEventGuildSkins`, `backgroundEventGuildSkins`, `bannerGuildSkins`, `menuGuildSkins`, `guardianThemeImages`).
- **Multi-build CSV**: `serializeTowerUnifiedCsvBuilds` exports several named lab + workshop + card builds in one file; `towerUnifiedPrimaryBuild` for single-build callers.
- **Themes in backup**: `theme,ownedIds` row in unified CSV (owned catalog IDs); `TowerThemesSnapshot` read/apply/sanitize helpers (`towerDataThemes.ts`).
- **Share codec v4**: Share payloads can include theme selection and owned catalog IDs (`LabsShareFileV4`); query param was **`?labs=`** until renamed to **`?tower=`** in 2.4.1.
- **Lab presets UX**: Share-link copy with success notice, delete build, and themes folded into `buildLabPresetsPayload`.
- **Main panel persistence**: Last-selected top-level panel (research, workshop, modules, cards, themes, tools/settings) survives reload (`mainPanelStorage`).
- **Tests**: Vitest coverage for multi-build CSV, theme roundtrip, share v4, main panel sanitization, and preset payload themes.

### Changed

- **Lab compare / import**: Unified CSV and share URLs apply themes when present; parsing aligned with multi-build tower CSV format.
- **Guardian previews**: Updated Finn, Nyra, Orbie, and Rolo guardian theme art.
- **i18n**: EN/ES strings for themes navigation, skin groups, coin bonus, and preset share/delete affordances.

## [2.2.0] - 2026-05-16

### Added

- **Full card inventory**: All **31 in-game cards** with wiki-aligned star tables (Lv.1–7), rarities, descriptions, and gem slot costs (`workshopGameCards`, `workshopGameCardWiki`); WebP art in `public/` for each card.
- **Card loadouts**: Five **preset tabs**, per-preset equip lists, configurable **equip slots** (up to 28 with Harmony keys), and star controls on the **Cards** page (`WorkshopCardsPanel`, `CardsPage`).
- **Card Mastery**: Card Mastery lab levels from the research `card-mastery` section scale equipped card effects via tier multipliers (`workshopCardMastery`).
- **Workshop stat wiring**: Equipped cards on the active preset (stars × Card Mastery) feed **displayed damage**, **attack speed**, and other workshop upgrade readouts (`workshopCardWorkshopDisplay`).
- **Reset cards**: Toolbar control and confirmation dialog to clear card stars, presets, and equip slots without touching workshop upgrade/enhance levels (`resetWorkshopCards`).
- **Tests**: Vitest coverage for card wiki tables, mastery multipliers, equipped-star rules, preset loadouts, and displayed-stat merges.

### Changed

- **Persistence**: `WorkshopPersistedV1` adds `cardStars`, `cardPresetLoadouts`, `cardActivePresetIndex`, and `cardEquipSlots`; legacy `simDamageCardStars` / `simAttackSpeedCardStars` / `simBerserkerCardStars` migrate into the new card model on load.
- **Workshop reset**: `resetWorkshopUpgradeLevels` now preserves card loadouts; card-only reset is separate from upgrade/enhance reset.
- **Displayed stats**: Damage, attack speed, defense, and utility workshop modules merge lab multipliers with equipped-card products (`workshopCardMultProduct`, `workshopCardAddPercentPoints`).
- **i18n**: EN/ES strings for all 31 card names, the Cards page, preset tabs, equip slots, and reset-cards affordances.

## [2.1.0] - 2026-05-16

### Added

- **Workshop Enhance tab**: Attack, defense, and utility enhancement panels with per-stat level controls, coin ladders, unlock spend gates, and Vitest coverage (`workshopEnhanceAttack`, `workshopEnhanceDefense`, `workshopEnhanceUtility`, tier-400/200 ladders, orb size, recovery package, free upgrades, enemy level skip).
- **Displayed stats**: Wiki-aligned **displayed damage** and **displayed attack speed** on workshop upgrade cards, driven by lab multipliers, enhancement tiers, and sim inputs (`workshopDisplayedDamage`, `workshopDisplayedAttackSpeed`, `workshopSimCards`, `workshopSimModules`, `workshopLabDisplayOpts`).
- **Cards & modules**: Top-level **Cards** and **Modules** navigation plus dedicated workshop panels; card stars, relics, perk quantity, berserker inputs, and assist-module substats feed displayed-stat formulas.
- **Tools & settings**: Combined `ToolsSettingsPage` (lab import/export/compare tools plus app settings); setting to show or hide lab and workshop budget panels (`budgetPanelsVisibility`).
- **Unified CSV**: Workshop snapshot keys (`ws,…`) alongside lab rows in `towerUnifiedCsv` for single-file backup and restore.
- **Maintenance**: `scripts/gen-utility-enhance-coins.mjs` to regenerate utility enhancement coin tables from wiki scrape data.

### Changed

- **Navigation**: Main app tabs for Research, Workshop, Modules, Cards, and Tools/Settings; workshop toolbar portaled into the in-panel header on the Workshop tab.
- **Workshop budgets & compare**: Extended `workshopBudgetAggregates` and `workshopCompare` for enhance spend and sim state; defense and utility upgrade modules aligned with lab-display options.
- **Persistence**: `WorkshopPersistedV1` expanded with enhance levels, sim card/module fields, and `mainTab` (`upgrade` | `enhance` | `modules` | `cards`).
- **i18n**: EN/ES strings for enhance stats, simulators, budget toggle, and new navigation labels.

## [2.0.0] - 2026-05-14

### Added

- **Workshop**: dedicated workshop experience with per-stat upgrade tables (damage, defense, attack speed/range, crit and super-crit, multishot, bounce shot, rapid fire, rend armor, utility, etc.), Vitest coverage on key curves, and resource glyphs (coin, power stone).
- **Workshop tooling**: `towerUnifiedCsv` for unified tower CSV handling; `workshopCompare` and `workshopBudgetAggregates` for comparisons and rollups; integration with the main app navigation and styling.

### Changed

- **Labs & research**: extensions to lab level CSV helpers, share codec, parse payload behaviour, presets storage, research types/cards, lab compare dialog, and i18n strings to align with the larger workshop surface.

## [1.0.7] - 2026-05-14

### Changed

- **Research sections**: tighter vertical footprint for the expand/collapse-all control (padding, line-height, smaller checkbox) so the first head row does not add extra gap before the next section.

## [1.0.6] - 2026-05-13

### Added

- **CSV lab backup**: import and export custom lab levels as CSV (`key,level` rows, UTF-8 BOM on export for Excel) from the lab backup dialog, with `labLevelOverridesCsv` helpers and Vitest coverage.

### Changed

- **Lab compare**: pasted payloads are **CSV** (same format as file export), a **page URL with `?labs=`**, or a raw **`u`/`z` share string** only; JSON lab exports are no longer accepted. **Insert current workspace** pastes CSV. Parser errors and EN/ES copy updated accordingly (`parseLabLevelsPayload`, `LabCompareDialog`, `dictionary`).

## [1.0.5] - 2026-05-13

### Added

- **`Bot Bot - Cooldown`** marginal ladder in `tower-labs.json` (25 levels); bots card milestone **T6 90**; toolkit alias **`Bot Bot Cooldown`** → hyphenated key.

### Changed

- **`Super Crit Multi`**: canonical `tower-labs.json` lab key renamed from **Super Crit Mult**; legacy **`Super Crit Mult`** name still resolves via toolkit alias.
- **Research / labs**: expanded benefit tests and JSDoc; minor updates to research JSON exports, lab aggregates, Spanish benefit strings, and Vite config.

## [1.0.4] - 2026-05-13

### Added

- **Favicon set**: PNG icons at 16×16, 32×32, 180×180 (apple-touch-icon), 192×192, and 512×512, generated from `public/tower-site-logo.webp`. Browser tabs and iOS Home Screen now show a sharp brand icon instead of a downscaled WebP.
- **Web app manifest**: `public/manifest.webmanifest` declares name, theme/background colours (`#0b1220` = `--sr-bg`), and 192 / 512 / maskable-512 icons, enabling "Add to Home Screen" on Android with a clean adaptive icon.
- **`theme-color` meta** in `index.html` tints the mobile browser UI to the app's dark background.

### Changed

- Removed the leftover Vite-template `public/favicon.svg` (unrelated purple-lightning artwork) and the `<link rel="icon">` pointing at `tower-site-logo.webp`; `index.html` now declares the full favicon / apple-touch-icon / manifest set.

## [1.0.3] - 2026-05-13

### Added

- **Social link previews**: Open Graph and Twitter Card meta tags in `index.html` so URLs unfurl to a rich preview card in Discord, Slack, iMessage, and other unfurlers. Title, description, site name, locale, and a `summary_large_image` card are all declared.
- **OG banner**: `public/og-banner.png` (real PNG, 1200×630) used as the `og:image` / `twitter:image`; shows a stylized lab/research dashboard alongside the app brand and tagline.

### Changed

- **Asset extensions**: Renamed `public/*.png` images (`cash`, `coin`, `elite-cell`, `gem`, `medal`, `power-stone`, `tower-site-logo`) to `*.webp` since the files were always WebP behind a `.png` extension. Updated references in `index.html`, `src/components/SelectResearch.tsx`, and `src/components/ResearchCard.tsx`. The favicon `<link>` now declares `type="image/webp"`.

## [1.0.2] - 2026-05-13

### Changed

- **Mobile layout**: Research cards stay **two columns** on narrow viewports; removed the temporary single-column and stacked-filter overrides. Below **36rem** viewport width, root `html` font-size is **100%** (desktop remains **200%**) so spacing and type scale down and the panel fits more comfortably on phones.

## [1.0.1] - 2026-05-13

### Changed

- **Mobile layout**: Research sections use a single-column card grid below 36rem viewport width; narrow phones stack filter controls and wrap the preset row for usable tap targets. Root padding respects safe-area insets; viewport meta includes `viewport-fit=cover`; `html` sets `text-size-adjust` for steadier mobile text scaling.
- **Research card display**: Golden Tower Bonus lab value strings include a leading `+` (e.g. `+0.15`) for consistency with other signed benefit lines.

## [1.0.0] - 2026-05-12

### Added

- **Lab compare**: `LabCompareDialog` plus `labCompare`, `labBudgetAggregates`, preset save/load (`labPresetsStorage`), URL-safe lab slugs (`labSlug`), sanitized level overrides (`labLevelOverridesSanitize`), and parsing for pasted/shared lab level payloads (`parseLabLevelsPayload`), each covered by tests where applicable.
- **Internationalization**: `I18nProvider` / context / hooks, English and Spanish UI strings, Spanish research overlay JSON, and benefit-line translation helpers for research cards.
- **Research data loading**: `loadResearchData` merges the static `public/research/` tree with overlay JSON; `scripts/write-research-overlay.mjs` writes overlay files from game strings.
- **Lab data scripts**: `scripts/gen-dissonant-echo-labs.mjs` and `scripts/gen-enhancement-coin-discount-labs.mjs` for generating tower-lab entries.
- **Shareable builds**: encode/decode full lab selections in the `?labs=` query parameter (`labsShareCodec`) with QR-friendly sharing support (`qrcode` dependency).
- **Version surface**: README badge and in-app version/changelog affordances driven by `package.json` via `src/appVersion.ts`.
- **Branding**: Tower wiki logo in the app header and as the favicon.

### Changed

- **Select research & layout**: Major `SelectResearch` expansion (filters, grouping, compare entry points, version UI, accessibility copy); updates to `ResearchSection`, `ResearchCard`, `App.tsx`, `main.tsx`, and substantial `App.css` work.
- **Types & costs**: Broader `src/types/research.ts` model; `labCosts` and research benefit calculations/tests aligned with new cards and overlays.
- **Data**: Large updates to `src/data/tower-labs.json` and `public/research/sections/main-research.json`.
- **UX polish**: Persisted section collapse state; trimmed development-only chrome and footer clutter.
- **Release metadata**: Set release to **1.0.0** in `VERSION`, `package.json`, and root entries in `package-lock.json`; README version badge updated to match.

## [0.1.0] - 2026-05-12

### Added

- Project documentation aligned with sibling repositories: `VERSION`, `AUTHORS`, `LICENCE`, `CHANGELOG.md`, and `RELEASE_NOTES_TEMPLATE.md`.
- Public research viewer: React + Vite app loading `public/research/` manifest and section JSON with typed parsing and lab cost integration from `src/data/tower-labs.json`.
- Supporting scripts under `scripts/` for lab CSV import and module tower-labs merge/build workflows.

### Changed

- `README.md` replaced the default Vite template with project-specific setup, layout, and licence notes.
- `package.json` version set to `0.1.0` to match `VERSION`.
