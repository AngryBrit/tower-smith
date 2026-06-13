# TowerSmith — Forge your perfect build

<img src="public/logo-towersmith.webp" width="100" alt="TowerSmith">

> A browser-based companion for [**The Tower**](https://www.techtreegames.com/) — plan labs, model upgrades, import your save, compare builds, and share loadouts without touching the game.

**[▶ Open TowerSmith](https://www.towersmith.com/)** · [Discord](https://discord.gg/hUDZ6nCmF3)

**Get The Tower:** [Google Play](https://play.google.com/store/apps/details?id=com.TechTreeGames.TheTower&hl=en_GB) · [App Store](https://apps.apple.com/gb/app/the-tower-idle-tower-defense/id1575590830) · [TechTree Store](https://store.techtreegames.com/thetower/)

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Version](https://img.shields.io/badge/version-3.1.0-2ea44f)
[![Netlify Status](https://api.netlify.com/api/v1/badges/7c57c118-c5d2-4b8c-a8db-3cd2eb32a4de/deploy-status)](https://app.netlify.com/projects/towerlabs/deploys)

---

## Screenshots

<p float="left">
  <img src="public/screenshots/workshop.jpg" width="180" alt="Workshop" />
  <img src="public/screenshots/lab.jpg" width="180" alt="Lab" />
  <img src="public/screenshots/cards.jpg" width="180" alt="Cards" />
  <img src="public/screenshots/modules.jpg" width="180" alt="Modules" />
  <img src="public/screenshots/bots.jpg" width="180" alt="Bots" />
  <img src="public/screenshots/themes.jpg" width="180" alt="Themes" />
  <img src="public/screenshots/relics.jpg" width="180" alt="Relics" />
  <img src="public/screenshots/builds.jpg" width="180" alt="Builds" />
</p>

---

## What TowerSmith does

| Area | What you can do |
|------|----------------|
| **Research** | Browse every research tree (main, attack, defense, utility, cards, perks, bots, modules, and more) with costs and benefits shown where wiki data allows. |
| **Labs** | Model upgrade costs and build times, compare configs side by side, save named presets, and use **Max All** to cap every visible lab at once. |
| **Workshop** | Simulate attack, defense, utility, and ultimate-weapon upgrades with full coin and power-stone costs. Buy-multiplier rail includes **MAX** (+ to cap, − to zero). The **Enhance** tab unlocks once Workshop Enhancements is researched. |
| **Bots** | Track the five event-shop bots (Flame, Thunder, Golden, Amplify, Bot Bot), medal unlock order, stat upgrades, and Bot+ abilities. BOTS lab levels update cooldown and duration live. |
| **Cards** | Manage your full 31-card inventory, star levels (Lv.1–7), five preset loadouts, equip-slot limits, and Card Mastery scaling. |
| **Modules** | Configure chassis modules (cannon / armor / core / generator) across epic→ancestral tiers, sub-module effects, assist unlocks, stone efficiency, and five saved module presets. |
| **Relics** | Catalog all 268 wiki relics with art, filter by unlock group, and have owned relics feed automatically into workshop stat formulas. |
| **Themes** | Track owned tower skins, backgrounds, banners, music, and guardians — including coin-bonus rollups per category. |
| **Guardians** | **GUARDIANS** tab: active guardian (ties to Themes), four chip slots (Bits unlock costs), six chips (Attack, Ally, Bounty, Fetch, Scout, Summon) with three upgrade tracks each from GOD tables under `tables/guardians/`. Import from **playerInfo.dat** or tower CSV; respec and workspace undo. |
| **Vault** | Placeholder tab reserved for future vault tooling (Effective Paths **Vault** workbook category). |
| **Displayed stats** | Workshop cards show in-game-aligned values: damage, DPM, health, defense, and utility rows fold in labs, cards, relics, sub-modules, and **Enhance** tiers (e.g. Recovery Package+ on Recovery Amount and Max Recovery). Stat values and upgrade costs come from GOD tables under `tables/`. |

---

## Getting your data in

**Import your save** — On the LAB tab, load a gzip-compressed **playerInfo.dat** from The Tower (account menu → tower backup). TowerSmith maps your lab levels, workshop stats, bots, ultimates, modules, card stars, relics, guardian chips, guild ID, and owned themes in one shot.

- **Android:** tap **Import playerInfo.dat** to copy the save-folder path, then pick the file.
- **iOS:** import a copy from Files, iCloud, or a backup extract (the game sandbox isn't browsable in-browser).

**CSV backup** — Export/import a `tower_csv_v1` file with one or more named builds. Row types include:

| Row prefix | Purpose |
|------------|---------|
| `build,name,…` | Named build label |
| `lab,<section>-<item>,level` | Lab level overrides |
| `lab,gameResearchLevel,…` | Full `researchLevel[]` JSON array from the save |
| `ws,…` | Workshop snapshot (upgrades, enhance, bots, cards, modules, relics) |
| `card,…` | Card stars, presets, equip slots |
| `module,…` | Module loadout presets |
| `relic,ownedIds` / `relic,simBonusFraction` | Owned relics and sim bonus |
| `theme,ownedIds` / `theme,selection` | Owned cosmetic IDs and active skin picks |
| `guardian,state` | Guardian chip slots, unlocks, and upgrade tracks |

Swap builds without overwriting your current setup.

**Effective Paths sync** — On the LAB tab → **Tower Backup & Sharing**, open **Effective Paths sync…** to import from or export to community **Effective Paths** Google Sheets workbooks (see [Effective Paths sync](#effective-paths-sync-google-sheets) below).

---

## Sharing builds

**Share links** encode a full snapshot (labs, workshop, build name, themes) in the `?tower=` query string. Copy the URL or generate a QR code — anyone opening the link gets the same build.

**Community gallery** — Browse and load community builds from the **BUILDS** tab. Sign in with Google, Discord, or Twitch (footer) to publish your own. **Copy share link** publishes and copies a short `?build=<uuid>` URL in one step. Owners can set category and visibility, regenerate the share link, and see upvote counts. Filter by author or registered guild name.

---

## Effective Paths sync (Google Sheets)

TowerSmith can **import from** and **export to** the community **Effective Paths** spreadsheet ecosystem — the IDS Master gateway tab plus linked workbooks (Laboratory, Workshop, Ultimate Weapons, Cards, Modules, Bots, Guardians, Themes & Songs, Relics, and future Vault).

**User flow**

1. **Tools / Settings** → paste your **IDS Master** spreadsheet URL or ID (stored locally).
2. **LAB tab** → **Tower Backup & Sharing** → **Effective Paths sync…**
3. Sign in with Google (OAuth; scope: Google Sheets). TowerSmith reads linked workbook IDs from the IDS tab and shows per-category import/export actions.
4. **Import** pulls lab levels, workshop stats, relic ownership, themes, cards, bots, guardians, modules, and related data into your workspace.
5. **Export** writes TowerSmith state back to the linked sheets. Exports can stage preview tabs titled `… (TowerSmith preview)` so you can review before promoting changes to the live sheet tabs.

**Requirements**

- A configured **Google OAuth Web client** with the Google Sheets API enabled. Set `VITE_GOOGLE_SHEETS_OAUTH_CLIENT_ID` in `.env` (local) and Netlify build env (production). See [`.env.example`](.env.example).
- **Netlify Functions** for server-side Sheets API calls: use `npm run dev:netlify` locally or deploy to Netlify. Plain `npm run dev` runs the UI only (OAuth may work for listing, but import/export endpoints need Functions).
- Your Google account must have edit access to the IDS Master sheet and each linked workbook.

**Maintainer code paths:** [`src/effectivePaths/`](src/effectivePaths/) (parsers, sheet layouts, staging), [`netlify/functions/import-effective-paths.ts`](netlify/functions/import-effective-paths.ts), [`export-effective-paths.ts`](netlify/functions/export-effective-paths.ts), [`ids-gateway-effective-paths.ts`](netlify/functions/ids-gateway-effective-paths.ts).

---

## App experience

- **Appearance** — Dark (default), Light, and High contrast themes in Tools / Settings.
- **Keyboard shortcuts** — `/` focuses search on Labs, Relics, and Themes; `1`–`9` switches main tabs (Workshop, Labs, Cards, Modules, Bots, Guardians, Themes, Relics, Vault); `0` opens the community Gallery; `Ctrl+Z` undoes the last Max All or reset (up to 20 steps); `Esc` closes the top dialog. Full list under Tools / Settings → **Keyboard shortcuts**.
- **Bug Buster** — Floating report button attaches an optional tower CSV and player save excerpt to bug reports (email or clipboard).
- **Deep links** — Link directly to a lab card, workshop stat, ultimate weapon, or relic via URL hash or query param.
- **PWA** — Install to your home screen (Tools / Settings → **Install app** on Android; Safari Share → Add to Home Screen on iOS). Works with limited offline support.
- **Persistence** — All settings, snapshots, presets, and owned IDs survive reloads. Full reset available in Tools / Settings.

For release history, see [`CHANGELOG.md`](CHANGELOG.md).

---

## Getting started (local dev)

**Requirements:** Node.js 20 or newer (CI uses Node 22).

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173/`). The dev server also advertises a **Network** URL for testing on a phone on the same Wi-Fi.

**Production build**

```bash
npm run build   # typecheck + bundle → dist/
npm run preview # serve dist/ locally
```

**With the community gallery**

```bash
npm run dev:netlify
```

Requires Supabase env vars for the gallery — copy `.env.example` to `.env` and fill in your keys. For Effective Paths sync, also set `VITE_GOOGLE_SHEETS_OAUTH_CLIENT_ID`. See [Community gallery](#community-gallery-netlify--supabase) and [Effective Paths sync](#effective-paths-sync-google-sheets).

**Note:** Netlify Dev runs Vite only (see [`netlify.toml`](netlify.toml)); it does not re-run `copy-god-tables-to-public.mjs` on every start. After editing GOD tables under `tables/`, run `node scripts/copy-god-tables-to-public.mjs` or use `npm run dev` / `npm run build`.

---

## npm scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR (runs GOD table copy first). |
| `npm run dev:netlify` | Vite + Netlify Functions locally (gallery, guild, Effective Paths). |
| `npm run build` | Typecheck and bundle to `dist/` (`prebuild` copies GOD tables to `public/tables/`). |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm run test` | Run Vitest unit tests. |
| `npm run test:e2e` | Playwright end-to-end tests (share-link flow). |
| `npm run check:i18n` | Fail if locale dictionaries drift from English keys. |
| `npm run import-lab` | Import lab CSV into `tower-labs.json` (`scripts/import-lab-csv.mjs`). |
| `npm run wiki-stamp` | Bump the wiki/game alignment date shown in Tools / Settings. |
| `npm run post-changelog-discord` | Post latest CHANGELOG entry to Discord (needs webhook env). |
| `npm run icons` | Re-rasterize `public/app-icon.svg` → favicon and PWA PNGs. |
| `npm run og-banner` | Regenerate the 1200×630 social preview image. |
| `npm run research-unmapped` | List unmapped `researchLevel[]` slots (`docs/research-level-unmapped.txt`). |
| `npm run decode-wiki-html` | Decode wiki HTML exports for table scraping. |
| `npm run scrape-wiki-table` | Scrape a wiki table to TSV/JSON. |

---

## Project layout (key paths)

| Path | Role |
|------|------|
| `public/research/` | Runtime research data: `manifest.json` and section JSON files. |
| `public/tables/` | Runtime GOD table JSON copied from `tables/` at build/dev start (workshop, labs, guardians). |
| `tables/` | **GOD** ground truth: `labs/`, `workshop/`, `guardians/` JSON. Do not edit to satisfy tests without evidence. Labs: [`src/data/labGodTables.ts`](src/data/labGodTables.ts) + [`src/labCosts.ts`](src/labCosts.ts). Workshop: [`src/data/workshopGodTables.ts`](src/data/workshopGodTables.ts) + [`src/workshopCosts.ts`](src/workshopCosts.ts). Guardians: [`src/data/guardianChipGodTables.ts`](src/data/guardianChipGodTables.ts). Refresh: `node scripts/sync-lab-god-tables.mjs`, `node scripts/import-workshop-god-tsv.mjs` + `node scripts/sync-workshop-god-tables.mjs`, `node scripts/copy-god-tables-to-public.mjs`. |
| `src/data/` | Lab costs (`tower-labs.json`), workshop curves, bot/ultimate/relic/module/guardian tables, and generated data files. Coin formatting rules: [`src/labCosts.ts`](src/labCosts.ts) (see [Lab coin display](#lab-coin-display)). |
| `src/effectivePaths/` | Effective Paths Google Sheets parsers, sheet layouts, import/export staging, IDS Master workbook discovery. |
| `src/playerSave/` | playerInfo.dat NRBF decoder, save-field mappings, and import pipeline. See [Player save ↔ TowerSmith mapping](#player-save--towersmith-mapping) and [`NOTICE.md`](src/playerSave/NOTICE.md). |
| `src/components/` | All UI — research browser, workshop, bots, modules, cards, relics, themes, guardians, settings, compare dialogs, Effective Paths sync. |
| `src/i18n/` | English, Spanish, and German UI strings and research overlays. |
| `netlify/functions/` | Netlify Functions: community gallery, guild name registry, Effective Paths Sheets API (see table below). |
| `scripts/` | Data maintenance scripts (lab/workshop/guardian GOD import, wiki scrapers, save dump tools, icon/banner regen). |
| `supabase/schema.sql` | Gallery and guild database schema. |

### Netlify Functions

| Group | Functions | Purpose |
|-------|-----------|---------|
| **Gallery** | `submit-tower`, `list-towers`, `get-tower`, `delete-tower`, `vote-tower`, `set-tower-visibility`, `set-tower-category`, `regenerate-tower-link`, `admin-me` | Publish, browse, upvote, and manage community builds |
| **Guild** | `register-guild`, `update-guild`, `resolve-guild` | Registered guild names for profile and gallery filters |
| **Effective Paths** | `import-effective-paths`, `export-effective-paths`, `ids-gateway-effective-paths`, `list-effective-paths-sheets`, `workbook-access-effective-paths` | Google Sheets import/export and workbook access checks |

After editing files under `public/research/` or `src/data/`, save and refresh — Vite HMR picks up most changes automatically.

---

## Community gallery (Netlify + Supabase)

The gallery uses Netlify Functions as the API layer and Supabase (Postgres + Storage) for data. Anyone can browse and load builds; publishing requires signing in.

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. **Storage** — the schema creates a **private** `tower-payloads` bucket (JSON only, 2 MB per file). Gallery builds and per-account workspace backups are read/written only via Netlify Functions (service role), not public URLs. If you created this bucket earlier as public, run the hardening upgrade in [`supabase/schema.sql`](supabase/schema.sql) (search for `harden tower-payloads`).
4. **Auth** — enable Google, Discord, and Twitch providers. In **Authentication → URL Configuration**:
   - **Site URL:** your production origin (e.g. `https://www.towersmith.com/`)
   - **Redirect URLs:** add both production and local dev origins (e.g. `http://localhost:5173/**`). If sign-in from localhost lands on production, localhost is missing here.
   - Google/Discord/Twitch redirect URI: `https://<project>.supabase.co/auth/v1/callback`.
5. Copy keys into `.env` (local) and your Netlify site env:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (build + browser)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Functions only)

   **Important:** All four values must come from the **same** Supabase project (same `ref` in the JWT). If the browser signs in to project A but Functions verify with project B, publish returns **401** while guild resolve still works. After changing `VITE_*` vars, trigger a **new production build** (not just a functions-only deploy).

### Optional env flags

| Flag | Effect |
|------|--------|
| `TOWER_GALLERY_SUBMIT_DISABLED=1` | Reject new submissions. |
| `VITE_TOWER_GALLERY_DISABLED=1` | Disable gallery API calls in the frontend build. |
| `TOWER_GALLERY_ADMIN_USER_IDS` | Comma-separated Supabase user UUIDs allowed to use **Gallery admin** (see below). |

### Gallery admin

For allowlisted Supabase users, **Tools / Settings** includes a **Gallery admin** panel (requires `npm run dev:netlify` or a Netlify deploy with Functions).

- **List** — Loads every row in `public.builds` (public and private/unlisted), 20 per page with **Load more**. The public **BUILDS** tab only lists `visibility = public` builds (signed-in users also see their own private builds in **My builds**).
- **Delete** — Removes the `builds` row and storage payload; old `?build=` links stop working.
- **Setup** — Sign in with the same provider used for publish, add your user UUID from the access-denied hint (or Supabase **Authentication → Users**) to `TOWER_GALLERY_ADMIN_USER_IDS` in Netlify (and `.env` for local Functions), then restart `dev:netlify`.

List API: authenticated `GET /api/towers?admin=1` (see [`list-towers.ts`](netlify/functions/list-towers.ts)).

---

## Lab coin display

Research card **cost** lines use marginal `COST` values from [`src/data/tower-labs.json`](src/data/tower-labs.json), formatted in [`src/labCosts.ts`](src/labCosts.ts):

| Lab family | Function | Display rules (wiki-aligned) |
|------------|----------|------------------------------|
| **Assist Module** Substats / Bonus (8 cards) | `formatAssistModuleLabCoinDisplay` | Always **q**, never **T**. Raw ≥ 1e12 &lt; 1e15 → ÷ 1e12 (e.g. **250.00q**). Raw ≥ 1e15 → ÷ 1e15 (e.g. **3.75q**). All eight names alias to the `Assist Module Substats - Cannon` table. |
| Other coin labs (e.g. Ultimate Weapon Durations) | `formatLabCoinDisplay` | **T** below 1e15; **q** from 1e15 up (e.g. **2.00q**, not **2000.00T**). |
| Workshop medals / enhance panels | `formatCoinAbbrev` / `formatCoinAbbrevPreferT` | Workshop UI keeps **T** at trillion scale where the wiki does. |

Legacy snapshot strings in `public/research/sections/*.json` (e.g. `0.25 q`) are normalized on load via `normalizeCoinAbbrevDisplay` (Assist Module cards pass `assistModuleLab: true`).

---

## Player save ↔ TowerSmith mapping

**playerInfo.dat** is gzip-compressed Unity BinaryFormatter (NRBF). TowerSmith decodes it with [`src/playerSave/nrbf.ts`](src/playerSave/nrbf.ts) (adapted from [CrispStrobe/nrbf](https://github.com/CrispStrobe/nrbf); see [`NOTICE.md`](src/playerSave/NOTICE.md)).

| Save field / area | TowerSmith destination |
|-------------------|------------------------|
| `researchLevel[]` | Lab level overrides via `game*ResearchMapping.ts` files; index regenerated with `node scripts/gen-game-research-index.mjs` |
| `upgradeWorkshopLevel[]` | Workshop upgrade levels |
| `*BotPresets` / legacy `bots*Presets` | Bots tab ([`gameBotPresetMapping.ts`](src/playerSave/gameBotPresetMapping.ts), [`gameBotLegacyPresetMapping.ts`](src/playerSave/gameBotLegacyPresetMapping.ts)) — `levels[]` = `[cooldown, range, weaponStat2, weaponStat4]` |
| Module `infoIndex` / effects | Chassis and assist modules ([`gameModuleIndex.ts`](src/playerSave/gameModuleIndex.ts); `node scripts/gen-game-module-index.mjs`) |
| `guardianChipSlot`, `guardianChipUnlocked`, `guardianChipLevel` | Guardians tab ([`gameGuardianChipMapping.ts`](src/playerSave/gameGuardianChipMapping.ts)) |
| Relic unlock arrays | Owned relic IDs |
| Theme / banner / music unlock flags | Themes owned IDs and selection |
| `lastGuildID`, profile fields | Profile and gallery guild filter |

Pipeline entry points: [`decodePlayerInfo.ts`](src/playerSave/decodePlayerInfo.ts) → [`mapPlayerDataToTower.ts`](src/playerSave/mapPlayerDataToTower.ts) → [`importPlayerInfo.ts`](src/playerSave/importPlayerInfo.ts).

---

## Local maintainer docs (`docs/`)

The `docs/` folder is **gitignored**. Scripts write reference dumps there during save-format or research-mapping work:

| Output | Generator | Use |
|--------|-----------|-----|
| `docs/player-save-field-dump.json` / `.txt` | `node scripts/regenerate-player-save-dump.mjs` | Field inventory from a local `playerInfo.dat` |
| `docs/research-level-unmapped.txt` | `npm run research-unmapped` | Slots in `researchLevel[]` not yet mapped to a lab |
| `docs/game-workshop-index-map.csv` | `node scripts/export-game-research-id-map.mjs` | Workshop array index ↔ stat name |

Point scripts at your local save path (e.g. `h:/The Tower/playerInfo.dat`) when regenerating dumps. After mapping changes, run Vitest under `src/playerSave/` and update the relevant `game*Mapping.ts` file — never guess slot IDs without save evidence.

---

## Internationalization

UI is available in **English**, **Spanish**, and **German**. Research section and card names have locale overlays generated by scripts in `scripts/`. Run `npm run check:i18n` to verify all locale files stay in sync with the English key set.

---

## Development notes

- Run `npm run lint`, `npm run check:i18n`, and `npm run test` before pushing. CI (GitHub Actions) runs the same checks plus Playwright on every push/PR.
- **GOD tables** — Committed JSON under `tables/` is authoritative. Fix consumer code or tests when values disagree; do not edit tables to make tests pass without new evidence.
- **Ship checklist** — For user-visible releases: bump `VERSION` / `package.json`, add a [`CHANGELOG.md`](CHANGELOG.md) entry, add `whats_new_*` keys in en/de/es ([`src/whatsNew.ts`](src/whatsNew.ts)), run `npm run check:i18n`.
- **Discord release posts** — pushing a new top version in [`CHANGELOG.md`](CHANGELOG.md) to `main` posts release notes to Discord (`.github/workflows/discord-changelog.yml`). Add repo secret `DISCORD_CHANGELOG_WEBHOOK_URL` (channel webhook from Server Settings → Integrations → Webhooks). To backfill the latest entry: **Actions → Discord changelog → Run workflow** (force on), or locally `DISCORD_CHANGELOG_WEBHOOK_URL=... npm run post-changelog-discord -- --force`.
- Bump `dataVersion` in `public/research/manifest.json` when research data changes — this busts the PWA cache. Users can also force a refresh via **Tools / Settings → Refresh research data**.
- After editing `public/app-icon.svg`, run `npm run icons`. After changing the banner layout, run `npm run og-banner`.
- On Windows with OneDrive, Vite's cache is redirected to the system temp directory to avoid EPERM errors. Keep the project outside synced folders if issues persist.

---

## Versioning

Canonical version lives in `VERSION`, mirrored in `package.json`. Human-readable history is in [`CHANGELOG.md`](CHANGELOG.md).

---

## Licence and credits

Licensed under **[CC BY-NC-SA 4.0](LICENCE)**.  
Contributors are listed in [`AUTHORS`](AUTHORS).
