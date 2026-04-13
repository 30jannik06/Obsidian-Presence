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

[Unreleased]: https://github.com/30jannik06/Obsidian-Presence/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/30jannik06/Obsidian-Presence/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/30jannik06/Obsidian-Presence/releases/tag/v1.0.0
