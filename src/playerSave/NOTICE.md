# playerSave NRBF decoder

`nrbf.ts` is adapted from [CrispStrobe/nrbf](https://github.com/CrispStrobe/nrbf) (see that repository for license terms).

TowerSmith uses it to decode gzip-compressed **playerInfo.dat** saves from The Tower (Unity BinaryFormatter / NRBF). The import pipeline lives in this directory:

- [`decodePlayerInfo.ts`](decodePlayerInfo.ts) — file decode and typed `PlayerData` extraction
- [`gameBotLegacyPresetMapping.ts`](gameBotLegacyPresetMapping.ts) — legacy `bots*Presets` arrays (v28−) when `*BotPresets` lists are absent
- [`gameBotPresetMapping.ts`](gameBotPresetMapping.ts) — per-bot `levels[]` layout (`[cooldown, range, weaponStat2, weaponStat4]`)
- [`gameGuardianChipMapping.ts`](gameGuardianChipMapping.ts) — guardian chip slots, unlocks, and upgrade tracks
- [`mapPlayerDataToTower.ts`](mapPlayerDataToTower.ts) — maps save arrays to lab overrides and workshop state (`researchLevel[]` via `game*ResearchMapping.ts`; index: `node scripts/gen-game-research-index.mjs`)
- [`importPlayerInfo.ts`](importPlayerInfo.ts) — public entry used by the LAB tab UI

Maintainer reference tables and field dumps are generated locally under `docs/` (gitignored). See the README sections [**Player save ↔ TowerSmith mapping**](../../README.md#player-save--towersmith-mapping) and [**Local maintainer docs (`docs/`)**](../../README.md#local-maintainer-docs-docs).
