# Obsidian Presence

Show your Obsidian activity on Discord via Rich Presence.

**[Documentation](https://30jannik06.github.io/Obsidian-Presence/)**

## Features

- Displays your current vault and file name in Discord
- Shows whether you're in Edit or Preview mode
- Elapsed timer (total session or per-file)
- Auto-reconnects if Discord is closed and reopened
- Status bar indicator with click-to-reconnect or pause
- **Pause mode** — hide presence instantly via status bar, settings button, or command palette
- **Idle detection** — auto-shows AFK or clears presence after configurable inactivity timeout
- **Exclusion list** — keep specific files or folders private (e.g. `Privat/`)
- **Custom status format** — define your own text with `{file}`, `{vault}`, `{mode}` placeholders
- Reconnect button and live connection status in the settings tab
- Command palette entries: **Reconnect to Discord**, **Toggle Presence Pause**
- Up to 2 custom profile buttons (e.g. "View Repository")
- Custom Discord Application support (bring your own Client ID + images)
- Configurable via settings tab

## Settings

| Setting | Description |
|---|---|
| Discord Client ID | Your own Discord Application Client ID for custom images. Leave empty to use the default. |
| Show vault name | Toggle vault name in Discord status |
| Custom vault name | Override the displayed vault name |
| Show file name | Toggle current file name in status |
| Show file extension | Toggle `.md` extension in file name |
| Per-file timer | Reset timer on each new file vs. total session time |
| Show connection notices | Show notice on Discord connect |
| Details format | Custom top line (e.g. `Editing {fileNoExt}`) |
| State format | Custom bottom line (e.g. `{mode} in {vault}`) |
| Excluded patterns | Newline-separated list of paths to hide (e.g. `Privat/`) |
| Enable idle detection | Toggle idle detection |
| Idle timeout | Minutes of inactivity before going idle |
| When idle | Show "Away from keyboard" or clear presence entirely |
| Button 1 / 2 label | Text shown on the button (max 32 characters) |
| Button 1 / 2 URL | Link opened when the button is clicked (must start with `https://`) |

## Profile Buttons

You can add up to 2 clickable buttons to your Discord profile card — for example a link to your GitHub repository or website.

1. Open Settings → Obsidian Presence → **Profile Buttons**
2. Enter a label (e.g. `View Repository`) and a URL (e.g. `https://github.com/yourname/yourrepo`)
3. Leave label or URL empty to disable a button

> **Note:** Discord does not show your own buttons on your own profile. Ask someone else to check your profile to verify they appear.

## Custom Discord Application

By default the plugin uses a shared Discord Application with the Obsidian logo. If you want your own images and branding:

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Create a new application
3. Under **Rich Presence → Art Assets**, upload images named `obsidian`, `editing` and `reading`
4. Copy your Application's **Client ID**
5. Paste it into the **Discord Client ID** setting — the plugin reconnects automatically

## Installation

> **Important:** Always use a dedicated development vault, not your main vault.

1. Create a new empty vault in Obsidian for plugin development
2. Clone this repo into the vault's plugins directory:
   ```
   mkdir .obsidian\plugins
   cd .obsidian\plugins
   git clone https://github.com/30jannik06/obsidian-presence.git
   cd obsidian-presence
   ```
3. Install dependencies and build:
   ```
   pnpm install
   pnpm run build
   ```
4. In Obsidian: Settings → Community Plugins → turn off Restricted Mode → enable **Obsidian Presence**

### Development

```bash
pnpm run dev   # watch mode with sourcemaps
pnpm run build # production build
```

## Requirements

- Desktop only (Discord IPC is not available in mobile/web)
- Discord must be running

## Changelog

### v1.3.0
- Pause mode (status bar, settings button, command palette)
- Idle detection with configurable timeout and action
- Exclusion list for private files/folders
- Custom status format with placeholders
- Reconnect button cooldown, URL validation for buttons

### v1.2.0
- Live connection status in settings tab (🟢/🔴)
- Reconnect button in settings tab
- Reconnect to Discord command palette entry
- Up to 2 configurable profile buttons
- Fixed: connection status updates when Discord closes unexpectedly

### v1.1.0
- Initial public release

---

> This plugin is inspired by and based on [obsidian-discordrpc](https://github.com/lukeleppan/obsidian-discordrpc) by [lukeleppan](https://github.com/lukeleppan) (MIT License).
> It was rewritten from scratch because the original has not been maintained since 2022.
