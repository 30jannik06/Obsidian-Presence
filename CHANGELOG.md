# Changelog

## v1.4.1 — 2026-08-04

### Fixed
- Resolved Dependabot alerts by pinning transitive `ws`, `brace-expansion`, and `js-yaml` to patched versions (DoS advisories)
- Release workflow now attaches `styles.css` alongside `main.js` and `manifest.json`

### Changed
- Updated dev dependencies: `esbuild`, `prettier`, `typescript`, `typescript-eslint`, `obsidian` types

---

## v1.4.0 — 2026-05-15

### Added
- **Canvas support** — `.canvas` files are now tracked correctly; mode resets to "editing" when switching from a Markdown file to a Canvas
- **`{folder}` placeholder** — shows the parent folder path of the current file in custom format strings (e.g. `Projects/Backend`)
- **`{wordCount}` placeholder** — displays the live word count of the current file in custom format strings
- **Swap image layout** setting — flip the Discord image positions: editing/reading icon as the large image, Obsidian logo as the small image
- **Glob pattern support** in exclusion list — patterns like `Journal/**` and `*.canvas` now work correctly alongside plain-text patterns

---

## v1.3.5 — 2026-04-14

### Fixed
- Sentence case in all UI strings (Obsidian marketplace compliance)

---

## v1.3.0 — 2026-04-14

### Added
- **Privacy/Pause-Mode** — pause presence via status bar click, Pause button in settings, or command palette ("Toggle Presence Pause"). Status bar shows ⏸ in yellow while paused
- **Idle Detection** (enable/disable) — automatically shows "Away from keyboard" or clears presence after configurable inactivity timeout. Tracks file opens, mode changes and typing
- **Exclusion List** — hide specific files or folders from Discord (one pattern per line, matched against vault-relative path, e.g. `Privat/`)
- **Custom Status Format** — define your own Details and State strings using `{file}`, `{fileNoExt}`, `{vault}`, `{mode}` placeholders

### Fixed
- Reconnect button disables itself for 5 seconds to prevent spam
- Button URLs are validated — must start with `https://`, invalid URLs are rejected with a notice and filtered in RpcManager
- `data.json` added to `.gitignore` (local plugin settings should not be committed)

---

## v1.2.0 — 2026-04-14

### Added
- Live connection status indicator in the settings tab (🟢 Connected / 🔴 Not connected) — updates automatically when Discord connects or disconnects
- **Reconnect** button in the settings tab
- **Reconnect to Discord** command palette entry
- Up to 2 configurable profile buttons (label + URL) displayed on your Discord profile card

### Fixed
- Connection status flag now correctly resets when Discord closes unexpectedly (added `disconnected` event listener)

---

## v1.1.0 — 2026-03-01

Initial public release.

- Displays vault name, file name, and edit/preview mode in Discord Rich Presence
- Elapsed timer (total session or per-file)
- Auto-reconnect every 15 seconds
- Status bar indicator with click-to-reconnect
- Custom Discord Application support (Client ID + custom images)
- Configurable via settings tab
