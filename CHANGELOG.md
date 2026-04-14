# Changelog

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
