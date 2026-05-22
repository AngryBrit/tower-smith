# TowerSmith — workshop, cards, labs & themes

**TowerSmith** is a static web app for [**The Tower**](https://thetowergame.com/): browse research trees from exported JSON, model workshop upgrades, **bots**, and card loadouts, track cosmetic themes, compare builds, and share lab configurations from the browser.

**Live site:** [thetower.thatangrybrit.com](https://thetower.thatangrybrit.com/)  
**Repository:** [AngryBrit/tower-smith](https://github.com/AngryBrit/tower-smith) (npm package name `tower_export` is internal only; user-facing branding is always **TowerSmith**).

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Version](https://img.shields.io/badge/version-2.8.4-2ea44f)
[![Netlify Status](https://api.netlify.com/api/v1/badges/7c57c118-c5d2-4b8c-a8db-3cd2eb32a4de/deploy-status)](https://app.netlify.com/projects/towerlabs/deploys)

---

## Features

- **Research browser** — Loads [`public/research/manifest.json`](public/research/manifest.json) and every section file it lists (main, attack, defense, utility, ultimate weapon, cards, perks, bots, enemies, modules, card mastery, battle conditions). Cards show costs and benefits where data allows (e.g. **Dissonant Echo** labs: wiki **Value** = **0.50% × (level + 1)**, Lv.0→0.50% … Lv.20→10.50%). Labs with wiki Lv.0 **—** show the first-tier benefit at Lv.0 instead of `— » …`.
- **Lab economics** — Upgrade costs and build times from [`src/data/tower-labs.json`](src/data/tower-labs.json), aligned with the in-game lab grid.
- **Lab compare** — Side-by-side comparison, budget-style rollups, named presets (stored locally), and safe handling of pasted or imported level payloads.
- **Workshop** — Top-level **Workshop**, **Modules**, and **Cards** areas model in-game upgrade and enhance ladders (attack, defense, utility, ultimate weapons), with coin costs, marginal spend, and category budgets (coins on attack/defense/utility; **power stones** on the ultimate tab, including Plus tracks). The **Enhance** tab is locked until **Workshop Enhancements** is researched in Main Research; then attack, defense, and utility enhancements use wiki coin-spend unlock gates (hints use **T** abbreviations at trillions+), tier ladders, recovery package, orb size, and related utility curves. **Ultimate weapon** basic upgrades (power stones) for all nine weapons follow wiki milestone tables in [`workshopUltimateData.ts`](src/data/workshopUltimateData.ts) (source: [`scripts/gen-workshop-ultimate-data.mjs`](scripts/gen-workshop-ultimate-data.mjs); Vitest locks per-weapon stone totals). **Ultimate Weapon Plus** adds nine wiki secondary abilities (Smite, Cover Fire, Death Creep, …) with ordered unlock costs and per-ability upgrade tracks on each weapon card ([`workshopUltimatePlusData.ts`](src/data/workshopUltimatePlusData.ts), [`workshopUltimatePlus.ts`](src/data/workshopUltimatePlus.ts)). **Duration** and **cooldown** stats on ultimate weapons (and bots) display as plain seconds (e.g. `75s`, `200s`).
- **Bots** — Top-level **Bots** panel for the five event-shop bots (Flame, Thunder, Golden, Amplify, Bot Bot): medal unlock order (100→1200), per-stat upgrade tracks from wiki Basic Upgrades tables ([`workshopBotsData.ts`](src/data/workshopBotsData.ts), [`scripts/gen-workshop-bots-data.mjs`](scripts/gen-workshop-bots-data.mjs)), ON/OFF toggles, and **Bot+** abilities unlocked with **1,250** power stones once all five bots are owned. Bot+ uses separate stone-purchase flags and medal level tracks (Burning Ground, Titan Shock, Bonus Cells, Echoing Shot, Maximum Power) with Vitest coverage in [`workshopBots.test.ts`](src/data/workshopBots.test.ts). **BOTS** lab levels from the Lab tab update displayed cooldown, duration, and Thunder linger % on bot cards (same lab override source as Workshop).
- **Displayed stats** — Wiki-aligned **displayed damage** and **displayed attack speed** on workshop cards, folding in lab multipliers, enhancement tiers, equipped card stars (active preset × Card Mastery), relics, perk quantity, and assist-module substats from your lab levels.
- **Cards page** — Full **31-card** inventory with wiki art, star tables (Lv.1–7), rarities, five **preset loadouts**, equip-slot limits (gems / Harmony), and Card Mastery tier scaling from the research `card-mastery` section. Workshop **Cards** star steppers show **Max** at the cap and accept `max` (or the localized label) in the input. Scaled effect values (× Card Mastery) show as a badge overlay on card art. Equipped cards on the active preset feed workshop displayed-stat formulas.
- **Modules** — Top-level **Modules** tab with hub levels, equipped **cannon / armor / core / generator** chassis modules (epic→ancestral tiers), per-slot **sub-module effect** picks, and **assist chassis** unlocks (**1,000** power stones per slot; locked until purchased), unique-rarity upgrades, main/sub stone efficiency (1–70%), and equipped assist modules per slot (`workshopAssistChassisModule`, `AssistUnlocksPanel`). Assist hub pickers stay disabled until the slot is unlocked; unlock cards use the same layout as bot/ultimate unlock rows. Browsable chassis/sub-module catalogs with WebP art; optional **assist module wiki tables** (stone efficiency and unique rarity costs) when enabled in **Tools / Settings**. Module substats pull from MODULES research labs when data is loaded. **Five module loadout presets** save hub levels, chassis, assist, and sub-module picks (`workshopModulePresets`).
- **Relics** — **Relics** tab tracks **262** wiki relics (owned IDs, unlock-group filters, bonus breakdown) and optional displayed-damage bonus for workshop sim formulas. **Search** filters by name, description, or unlock text (`/` to focus).
- **Themes** — **Themes** tab catalogs tower milestone skins, event/guild tower and background art, menu guild seasons, banners, music, and guardians; track owned skins, active selection per category, and coin-bonus rollups (`ThemesPage`, `gameThemes.ts`, `public/themes/`). **Search** filters skins by name, event, and unlock metadata (`/` to focus).
- **Unified CSV backup** — Export and import a single **tower CSV** (`tower_csv_v1`) with one or more **named builds** (lab levels, workshop `ws,…` rows, card stars/presets) plus optional global **theme** owned IDs via [`src/towerUnifiedCsv.ts`](src/towerUnifiedCsv.ts). `ws` rows include ultimate Plus levels, **bot** stat levels / owned / active / Bot+ flags and levels, assist unlocks/chassis/rarity/efficiency fields, and the **active** module/relic sim; the five **module loadout presets** stay in browser workshop storage (and in lab compare named presets), not in tower CSV rows.
- **Shareable builds** — Encode lab levels, full workshop snapshot (including bots), optional build name, and owned theme IDs in the `?tower=` query string (share codec **v4**); optional QR code for sharing.
- **Languages** — English, Spanish, and German UI; Spanish and German research titles and card names are overlaid from bundled JSON (see [Internationalization](#internationalization)).
- **Persistence** — Section collapse state, locale, last-selected main panel (Research, Workshop, **Bots**, Modules, Cards, Relics, Themes, Tools / Settings), workshop snapshot (bot levels and Bot+, ultimate Plus levels, chassis and assist modules, five module loadout presets, relics, submodule picks), lab compare named presets (with themes), theme owned/selection state, and optional budget-panel, chassis/submodule/assist-wiki catalog visibility survive reloads (`localStorage`, keys prefixed `tower-export-`). **Tools / Settings** offers a confirmed **full reset** that clears all `tower-export-*` keys and reloads ([`fullResetStorage`](src/fullResetStorage.ts)).


For release history, see [`CHANGELOG.md`](CHANGELOG.md).

---

## Requirements

- **Node.js** 20 or newer (current LTS is recommended).

---

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (by default `http://localhost:5173/`). The dev server also listens on your LAN (`server.host: true` in `vite.config.ts`) and prints a **Network** URL for testing on a phone or tablet on the same Wi‑Fi. It serves `public/` at the site root, so `/research/manifest.json` resolves to `public/research/manifest.json`.

**Production build**

```bash
npm run build
npm run preview
```

`npm run build` runs the TypeScript project build and Vite; output is written to `dist/`.

---

## npm scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start the Vite dev server with HMR. |
| `npm run build` | Typecheck and emit a production bundle to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint on the repo. |
| `npm run test` | Run Vitest unit tests (`src/**/*.test.ts`). |
| `npm run import-lab` | Wrapper for [`scripts/import-lab-csv.mjs`](scripts/import-lab-csv.mjs) (CSV → lab helper). |
| `npm run icons` | Rasterize [`public/app-icon.svg`](public/app-icon.svg) into favicon and PWA PNGs under `public/`. |
| `npm run og-banner` | Regenerate [`public/og-banner.svg`](public/og-banner.svg) and [`public/og-banner.png`](public/og-banner.png) (1200×630 social preview). |

---

## Maintenance scripts (`scripts/`)

These are run with Node directly when you update data or regenerate assets:

| Script | Purpose |
|--------|--------|
| [`import-lab-csv.mjs`](scripts/import-lab-csv.mjs) | Import lab rows from CSV (also available as `npm run import-lab`). |
| [`build-module-tower-labs.mjs`](scripts/build-module-tower-labs.mjs) | Build pipeline for per-module lab JSON. |
| [`merge-module-tower-labs.mjs`](scripts/merge-module-tower-labs.mjs) | Merge module exports into `src/data/tower-labs.json`. |
| [`write-research-overlay.mjs`](scripts/write-research-overlay.mjs) | Regenerate [`src/i18n/research-overlay.es.json`](src/i18n/research-overlay.es.json) from the manifest and Spanish string tables. |
| [`write-research-overlay-de.mjs`](scripts/write-research-overlay-de.mjs) | Regenerate [`src/i18n/research-overlay.de.json`](src/i18n/research-overlay.de.json) from the manifest and German string tables. |
| [`patch-relics-catalog.mjs`](scripts/patch-relics-catalog.mjs) | Apply wiki table corrections to [`workshopRelics.generated.json`](src/data/workshopRelics.generated.json). |
| [`gen-dissonant-echo-labs.mjs`](scripts/gen-dissonant-echo-labs.mjs) | Generate Dissonant Echo lab duration/cost rows and patch `tower-labs.json` (wiki-aligned). |
| [`gen-enhancement-coin-discount-labs.mjs`](scripts/gen-enhancement-coin-discount-labs.mjs) | Generate enhancement coin discount lab rows and patch `tower-labs.json`. |
| [`gen-utility-enhance-coins.mjs`](scripts/gen-utility-enhance-coins.mjs) | Regenerate utility enhancement coin ladders (`workshopEnhanceUtilityTier200`, free upgrades, enemy level skip) from a wiki table scrape. |
| [`gen-workshop-ultimate-data.mjs`](scripts/gen-workshop-ultimate-data.mjs) | Regenerate ultimate-weapon basic-upgrade milestone tables (`workshopUltimateData.ts`) from embedded wiki rows. |
| [`gen-workshop-bots-data.mjs`](scripts/gen-workshop-bots-data.mjs) | Regenerate bot basic-upgrade and Bot+ milestone tables (`workshopBotsData.ts`) from embedded wiki rows. |
| [`generate-dictionary-de.mjs`](scripts/generate-dictionary-de.mjs) | Regenerate [`dictionary.de.ts`](src/i18n/dictionary.de.ts) from `tmp-strings-en.json` and `dictionary-de-by-key.json` (maintainer workflow). |
| [`analyze-es-keys.mjs`](scripts/analyze-es-keys.mjs) | Compare English vs Spanish UI keys (lists keys still identical to EN in `dictionary.es.ts`). |
| [`build-app-icon-svg.mjs`](scripts/build-app-icon-svg.mjs) | Legacy: rebuild `app-icon.svg` from `app-icon-maskable.svg` (canonical source is `public/app-icon.svg`). |
| [`generate-app-icons.mjs`](scripts/generate-app-icons.mjs) | Rasterize `app-icon.svg` → favicon / apple-touch / PWA PNGs (`npm run icons`). |
| [`generate-og-banner.mjs`](scripts/generate-og-banner.mjs) | Build OG/Twitter banner SVG + PNG (`npm run og-banner`). |

Example:

```bash
node scripts/merge-module-tower-labs.mjs
node scripts/write-research-overlay.mjs
```

---

## Project layout

| Path | Role |
|------|------|
| [`public/research/`](public/research/) | Runtime research data: `manifest.json` and `sections/*.json`. |
| [`src/data/tower-labs.json`](src/data/tower-labs.json) | Lab upgrade costs, durations, and metadata used by the UI. |
| [`src/data/card-mastery-tier-labels.json`](src/data/card-mastery-tier-labels.json) | Tier labels for card mastery display. |
| [`src/types/research.ts`](src/types/research.ts) | Typed parsing and validation helpers for research JSON. |
| [`src/loadResearchData.ts`](src/loadResearchData.ts) | Fetches manifest + sections and returns typed `ResearchData`. |
| [`src/components/`](src/components/) | UI: research (`SelectResearch`, `ResearchCard`, …), workshop (`WorkshopPage`, `WorkshopUltimateWeaponCard`, `WorkshopUltimatePlusAbilityCard`, enhance panels), **bots** (`BotsPage`, `WorkshopBotCard`, `WorkshopBotSpecialCard`), `WorkshopModulesPanel`, `AssistUnlocksPanel`, `AssistModuleReference`, `RelicsPage`, `CardsPage`, `ThemesPage`, module catalogs/picker, `LabCompareDialog`, `SettingsPage`, and related pieces. |
| [`public/modules/`](public/modules/) | Chassis module and rarity-frame WebP art (cannon, armor, core, generator). |
| [`public/themes/`](public/themes/) | Theme preview art (tower, background, banners, menus, guardian). |
| [`src/towerDataThemes.ts`](src/towerDataThemes.ts) | Theme selection/owned snapshot helpers for CSV and presets. |
| [`src/data/workshop*.ts`](src/data/) | Per-stat upgrade/enhance curves, displayed-stat helpers, full card wiki/loadouts, **bot** and ultimate Plus tracks ([`workshopBots.ts`](src/data/workshopBots.ts)), chassis and assist module catalogs, relic stats, submodule selection, module simulators, and Vitest coverage. [`workshopEnhanceResearch.ts`](src/data/workshopEnhanceResearch.ts) gates the Enhance tab on Main Research **Workshop Enhancements**. |
| [`src/data/workshopModulePresets.ts`](src/data/workshopModulePresets.ts) | Five module loadout presets (hub levels, chassis, assist, sub-modules); persisted on `WorkshopPersistedV1`. |
| [`src/labPresetsStorage.ts`](src/labPresetsStorage.ts) | Workshop snapshot, lab compare named presets, card/module preset fields, and sanitization on load. |
| [`public/manifest.webmanifest`](public/manifest.webmanifest) | PWA name **TowerSmith**, theme colours, and icon list for Add to Home Screen. |
| [`public/app-icon.svg`](public/app-icon.svg), [`public/og-banner.png`](public/og-banner.png) | Brand icon and social preview image (regenerate with `npm run icons` / `npm run og-banner` after edits). |
| [`index.html`](index.html) | Document title, `theme-color`, favicon links, and Open Graph / Twitter Card meta tags. |
| [`public/*.webp`](public/) | Resource glyphs (coin, cash, …) and per-card art (`Damage.webp`, `Berserker.webp`, …) used by the Cards UI. |
| [`src/i18n/`](src/i18n/) | Locale provider; English in [`dictionary.ts`](src/i18n/dictionary.ts), Spanish in [`dictionary.es.ts`](src/i18n/dictionary.es.ts), German in [`dictionary.de.ts`](src/i18n/dictionary.de.ts); research overlays; benefit translation helpers. |
| [`src/labCompare.ts`](src/labCompare.ts), [`src/labBudgetAggregates.ts`](src/labBudgetAggregates.ts), [`src/workshopCompare.ts`](src/workshopCompare.ts), [`src/workshopBudgetAggregates.ts`](src/workshopBudgetAggregates.ts), … | Lab and workshop comparison, coin/stone budget rollups, presets, slugs, share codec, and unified CSV. |
| [`src/budgetPanelsVisibility.ts`](src/budgetPanelsVisibility.ts), [`src/assistModuleCatalogVisibility.ts`](src/assistModuleCatalogVisibility.ts) | Toggles for budget panels and optional assist wiki tables (persisted). |
| [`src/appVersion.ts`](src/appVersion.ts) | `APP_VERSION` and changelog URL (from `package.json`). |

After you edit files under `public/research/` or `src/data/`, save and refresh the browser (or let Vite HMR pick up changes).

---

## Sharing lab builds

The app serializes lab levels (and optional workshop, build name, and owned theme catalog IDs) into the **`tower`** query parameter (`?tower=…`). Share codec **v4** only (`LabsShareFile` with `v: 4`). Copy the URL from the share control, or use the QR path where offered. Anyone opening that URL with the same app version should decode to the same payload (within codec limits). Import/compare accepts **tower CSV**, `?tower=` URLs, raw `u…` / `z…` payloads, or inline share JSON — not legacy `?labs=` links or old share codecs.

---

## Tower CSV backup format

The first line must be `tower_csv_v1`; the header row is `type,key,value`. Each **build** block can include:

| Row type | Purpose |
|----------|---------|
| `build,name,…` | Optional label for the build (escaped if needed). |
| `lab,<grid-key>,…` | Custom lab level overrides (`section-row` keys). |
| `ws,<field>,…` | Workshop persisted fields (upgrade/enhance levels, ultimate Plus levels, **bot** stat levels, `*Owned` / `*Active`, Bot+ `*Unlocked` and `*Level`, assist chassis unlocks/efficiency, active module sim, relic ownership, etc.). Booleans are `true` / `false`; Bot+ levels may be `-1` when not stone-purchased. |
| `card,star.<id>,…` | Per-card star level. |
| `card,preset.<n>,…` | Pipe-separated equipped card IDs for preset *n*. |
| `card,activePresetIndex,…` / `card,equipSlots,…` | Active card preset and equip-slot limit. |
| `theme,ownedIds,…` | JSON array of owned theme catalog IDs (global, not per-build). |

Multi-build files repeat `build` / `lab` / `ws` / `card` sections; themes are written once at the end. **Module loadout presets** (five saved hub configurations) are stored in the workshop snapshot in the browser and in lab compare presets, but are **not** exported as `ws` rows today — only the active module sim fields round-trip in tower CSV.

---

## Internationalization

- Supported locales: **English (`en`)**, **Spanish (`es`)**, and **German (`de`)**.
- UI strings: English source keys in [`dictionary.ts`](src/i18n/dictionary.ts); Spanish in [`dictionary.es.ts`](src/i18n/dictionary.es.ts); German in [`dictionary.de.ts`](src/i18n/dictionary.de.ts). Every locale file must define the same `StringId` keys. Locale is stored under the key documented in [`src/i18n/constants.ts`](src/i18n/constants.ts).
- Spanish research **names** (sections and cards) come from [`src/i18n/research-overlay.es.json`](src/i18n/research-overlay.es.json), maintained by `scripts/write-research-overlay.mjs` when you refresh translations from your tables.
- German research **names** use the same overlay shape in [`src/i18n/research-overlay.de.json`](src/i18n/research-overlay.de.json), maintained by `scripts/write-research-overlay-de.mjs`.

---

## Development notes

- **Lint and tests** — Run `npm run lint` and `npm run test` before pushing substantive changes.
- **Branding assets** — After editing [`public/app-icon.svg`](public/app-icon.svg), run `npm run icons` so favicon and PWA PNGs stay in sync. After changing the banner layout or title in [`scripts/generate-og-banner.mjs`](scripts/generate-og-banner.mjs), run `npm run og-banner`. [`index.html`](index.html) and [`public/manifest.webmanifest`](public/manifest.webmanifest) hold the display name **TowerSmith** for tabs, unfurlers, and install prompts.
- **Windows / OneDrive** — This repo sets Vite [`cacheDir`](vite.config.ts) to the system temp directory (`vite-cache-tower_export`) to reduce permission issues when the tree lives under OneDrive or aggressive antivirus. If you still see EPERM on cache clears, keep the project outside synced folders or exclude the Vite cache from sync.

---

## Versioning and releases

- The canonical version string is in [`VERSION`](VERSION) and mirrored in [`package.json`](package.json) and the root package entry in [`package-lock.json`](package-lock.json). The in-app badge reads `package.json` via [`src/appVersion.ts`](src/appVersion.ts).
- Human-readable history is in [`CHANGELOG.md`](CHANGELOG.md) (Keep a Changelog, SemVer).
- GitHub release notes can follow [`RELEASE_NOTES_TEMPLATE.md`](RELEASE_NOTES_TEMPLATE.md).

---

## Licence and credits

Licensed under **CC BY-NC-SA 4.0** — see [`LICENCE`](LICENCE).

Contributors are listed in [`AUTHORS`](AUTHORS).
