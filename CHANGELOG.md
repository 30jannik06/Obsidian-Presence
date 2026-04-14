# Changelog

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
