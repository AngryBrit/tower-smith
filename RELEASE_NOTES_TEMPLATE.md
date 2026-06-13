## TowerSmith {{VERSION}}

Release date: {{DATE}}

### Highlights

{{HIGHLIGHTS}}

### Fixes

{{FIXES}}

### Validation

{{VALIDATION}}

### Notes

- **TowerSmith** is the user-facing app name (browser title, PWA manifest, social previews). The GitHub repo is [`AngryBrit/tower-smith`](https://github.com/AngryBrit/tower-smith); the npm package name `tower_export` is internal.
- Live site: [www.towersmith.com](https://www.towersmith.com/).
- **Share links** use `?tower=` (codec v4 only). Short community links use `?build=<uuid>`.
- **Tower CSV** backups use magic line `tower_csv_v1` — includes `lab`, `ws`, `card`, `module`, `relic`, `theme`, `guardian`, and multi-`build` rows.
- **playerInfo.dat import** (LAB tab) maps labs, workshop, bots, modules, cards, relics, guardian chips, guild ID, and owned cosmetic themes from the in-game save.
- **Effective Paths sync** — LAB → Tower Backup & Sharing → Effective Paths sync… (Google Sheets; requires OAuth client ID and Netlify Functions).
- **Guardians tab** — chip loadout and upgrades; round-trips in tower CSV via `guardian,state`.
- **Deep links:** `#lab-slug`, `?lab=…`, `?workshop=…`, `?relic=…`.
- **Keyboard shortcuts:** `1`–`9` main tabs, `0` Gallery; `/` search on Labs/Relics/Themes.
- **Appearance:** dark (default), light, and high contrast themes in Tools / Settings.
- **Gallery auth:** Google, Discord, or Twitch via Supabase.
- Align `VERSION`, `package.json`, `package-lock.json`, and the release tag for each release.
- Full historical change detail lives in [`CHANGELOG.md`](CHANGELOG.md).
