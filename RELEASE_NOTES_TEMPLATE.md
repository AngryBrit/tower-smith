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
- Live site: [thetower.thatangrybrit.com](https://thetower.thatangrybrit.com/).
- **Share links** use `?tower=` (codec v4 only). Short community links use `?build=<uuid>`.
- **Tower CSV** backups use magic line `tower_csv_v1` (includes bot `ws` rows since 2.8.0).
- **playerInfo.dat import** (LAB tab) maps labs, workshop, bots, modules, cards, relics, and owned cosmetic themes from the in-game save.
- **Deep links:** `#lab-slug`, `?lab=…`, `?workshop=…`, `?relic=…`.
- **Appearance:** dark (default), light, and high contrast themes in Tools / Settings.
- Align `VERSION`, `package.json`, `package-lock.json`, and the release tag for each release.
- Full historical change detail lives in [`CHANGELOG.md`](CHANGELOG.md).
