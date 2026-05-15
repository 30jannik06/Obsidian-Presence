---
title: Changelog
---

# Changelog

[← Back](index)

All notable changes to Obsidian Presence are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [1.4.0] — 2026-05-15

### Added
- **Canvas support** — `.canvas` files are now tracked correctly; mode resets to "editing" when switching from a Markdown file to a Canvas
- **`{folder}` placeholder** — shows the parent folder path of the current file in custom format strings (e.g. `Projects/Backend`)
- **`{wordCount}` placeholder** — displays the live word count of the current file in custom format strings
- **Swap image layout** setting — flip the Discord image positions: editing/reading icon as the large image, Obsidian logo as the small image
- **Glob pattern support** in exclusion list — patterns like `Journal/**` and `*.canvas` now work correctly alongside plain-text patterns

---

## [1.3.0] — 2026-04-14

### Added
- **Privacy/Pause-Mode** — pause presence via status bar click, Pause button in settings, or command palette ("Toggle Presence Pause"). Status bar shows ⏸ in yellow while paused
- **Idle Detection** (enable/disable) — automatically shows "Away from keyboard" or clears presence after a configurable inactivity timeout. Tracks file opens, mode changes and typing
- **Exclusion List** — hide specific files or folders from Discord (one pattern per line, matched against vault-relative path, e.g. `Privat/`)
- **Custom Status Format** — define your own Details and State strings using `{file}`, `{fileNoExt}`, `{vault}`, `{mode}` placeholders

### Fixed
- Reconnect button disables itself for 5 seconds to prevent spam
- Button URLs validated — must start with `https://`, invalid URLs rejected with a notice and filtered in RpcManager
- `data.json` added to `.gitignore`

---

## [1.2.0] — 2026-04-14

### Added
- Live connection status indicator in the settings tab (🟢 Connected / 🔴 Not connected) — updates automatically when Discord connects or disconnects
- **Reconnect** button in the settings tab
- **Reconnect to Discord** command palette entry
- Up to 2 configurable profile buttons (label + URL) displayed on your Discord profile card

### Fixed
- Connection status flag now correctly resets when Discord closes unexpectedly (added `disconnected` event listener)

---

## [1.1.0] — 2026-04-13

### Added
- Custom Discord Client ID setting — use your own Discord Application for custom images and branding
- Small mode indicator icon in Discord (`editing` / `reading`) for custom apps
- GitHub Pages documentation site
- GitHub issue templates (bug report, feature request) and PR template
- Automated release workflow via GitHub Actions

### Changed
- Refactored `main.ts` into focused modules: `types.ts`, `rpcManager.ts`, `settingsTab.ts`, `main.ts`

### Fixed
- Deprecated `activeLeaf` API replaced with `getActiveViewOfType(MarkdownView)`

---

## [1.0.0] — 2026-04-13

### Added
- Discord Rich Presence showing vault name, file name and edit/preview mode
- Elapsed timer (total session or per-file)
- Auto-reconnect every 15 seconds if Discord is closed
- Status bar indicator (green/red) with click-to-reconnect
- Settings tab with 6 configurable options

[Unreleased]: https://github.com/30jannik06/Obsidian-Presence/compare/1.4.0...HEAD
[1.4.0]: https://github.com/30jannik06/Obsidian-Presence/compare/1.3.5...1.4.0
[1.3.0]: https://github.com/30jannik06/Obsidian-Presence/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/30jannik06/Obsidian-Presence/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/30jannik06/Obsidian-Presence/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/30jannik06/Obsidian-Presence/releases/tag/v1.0.0
