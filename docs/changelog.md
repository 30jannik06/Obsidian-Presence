---
title: Changelog
---

# Changelog

[← Back](index)

All notable changes to Obsidian Presence are documented here.

---

## v1.1.0
**Modular Refactor & Custom Discord App Support**

### Added
- Custom Discord Client ID setting — use your own Discord Application for custom images and branding
- Small mode indicator icon in Discord (`editing` / `reading`) for custom apps

### Changed
- Split `main.ts` into focused modules: `types.ts`, `rpcManager.ts`, `settingsTab.ts`, `main.ts`
- Fixed deprecated `activeLeaf` API → `getActiveViewOfType(MarkdownView)`

---

## v1.0.0
**Initial Release**

### Added
- Discord Rich Presence showing vault name, file name and edit/preview mode
- Elapsed timer (total session or per-file)
- Auto-reconnect every 15 seconds if Discord is closed
- Status bar indicator (green/red) with click-to-reconnect
- Settings tab with 6 configurable options
