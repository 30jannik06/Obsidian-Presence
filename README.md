# Discord RPC

Show your Obsidian activity on Discord via Rich Presence — vault name, file, edit/reading mode and an elapsed timer, directly in your Discord profile.

**[Documentation](https://30jannik06.github.io/Obsidian-Presence/)**

## Features

- Vault name and current file shown in Discord
- Edit / Reading mode detection — shown as icon and status text
- **Canvas file support** — `.canvas` files tracked correctly, no stale presence on view switch
- Elapsed timer — total session or per-file
- Auto-reconnect every 15 seconds if Discord restarts
- Status bar indicator (green/red/yellow) with click-to-reconnect or pause
- **Pause mode** — hide presence via status bar, settings button, or command palette
- **Idle detection** — show AFK or clear presence after configurable inactivity timeout
- **Exclusion list** — hide files or folders from Discord, supports glob patterns (`Journal/**`, `*.canvas`)
- **Custom status format** — `{file}`, `{fileNoExt}`, `{folder}`, `{vault}`, `{mode}`, `{wordCount}`, `{lineCount}`, `{meta:key}`
- **Swap image layout** — flip editing/reading icon and Obsidian logo positions
- Up to 2 custom profile buttons (e.g. "View Repository")
- Custom Discord Application support (bring your own Client ID + images)

## Settings

| Setting | Description |
|---|---|
| Discord Client ID | Your own Discord Application ID for custom images. Leave empty for the default. |
| Show vault name | Toggle vault name in Discord status |
| Custom vault name | Override the displayed vault name |
| Show file name | Toggle current file name in status |
| Show file extension | Toggle `.md` extension in file name |
| Per-file timer | Reset timer on each new file vs. total session time |
| Show connection notices | Show notice on Discord connect |
| No file open text | Text shown when no file is active. Default: `No file open` |
| Swap image layout | Flip editing/reading icon and Obsidian logo positions |
| Details format | Custom top line, e.g. `Editing {fileNoExt}` |
| State format | Custom bottom line, e.g. `{mode} in {vault} ({wordCount} words)` |
| Excluded patterns | One pattern per line. Supports plain text and globs (`Journal/**`, `*.canvas`) |
| Enable idle detection | Toggle idle detection |
| Idle timeout | Minutes of inactivity before going idle |
| When idle | Show "Away from keyboard" or clear presence entirely |
| Button 1 / 2 label | Text shown on the button (max 32 characters) |
| Button 1 / 2 URL | Link opened when the button is clicked (must start with `https://`) |

### Custom format placeholders

| Placeholder | Description |
|---|---|
| `{file}` | Full file name including extension |
| `{fileNoExt}` | File name without extension |
| `{folder}` | Parent folder path |
| `{vault}` | Vault name |
| `{mode}` | `Editing` or `Reading` |
| `{wordCount}` | Live word count |
| `{lineCount}` | Live line count |
| `{meta:key}` | Any frontmatter value, e.g. `{meta:project}` |

## Profile Buttons

Add up to 2 clickable buttons to your Discord profile card.

1. Open **Settings → Community Plugins → Discord RPC → Profile Buttons**
2. Enter a label (e.g. `View Repository`) and URL (e.g. `https://github.com/yourname/yourrepo`)
3. Leave label or URL empty to disable a button

> **Note:** Discord does not show your own buttons on your own profile — ask someone else to verify they appear.

## Custom Discord Application

By default the plugin uses a shared Discord Application with the Obsidian logo. To use your own images and branding:

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications) and create a new application
2. Under **Rich Presence → Art Assets**, upload images with these exact key names:

| Key | Used for |
|---|---|
| `obsidian` | Main large image |
| `editing` | Small icon in Edit mode |
| `reading` | Small icon in Preview/Reading mode |

3. Copy your **Application ID** and paste it into the **Discord Client ID** setting

## Installation

### Obsidian Community Store (recommended)

1. **Settings → Community Plugins → Browse** → search for `Discord RPC`
2. Click **Install**, then **Enable**
3. Make sure Discord is running — the status bar should turn green

### Manual

1. Download `main.js`, `manifest.json`, `styles.css` from the [latest release](https://github.com/30jannik06/Obsidian-Presence/releases/latest)
2. Copy to `.obsidian/plugins/discord-rpc/` in your vault
3. Enable **Discord RPC** in Settings → Community Plugins

## Requirements

- Obsidian **1.4.0** or higher
- Desktop only (Discord IPC is not available on mobile or web)
- Discord must be running locally

## Development

```bash
git clone https://github.com/30jannik06/Obsidian-Presence
cd Obsidian-Presence && pnpm install

pnpm dev          # watch mode with sourcemaps
pnpm build        # production build
pnpm lint         # ESLint check
pnpm format       # Prettier format
```

## Changelog

### v1.4.0
- Canvas file support — `.canvas` files tracked correctly
- New placeholders: `{folder}`, `{wordCount}`, `{lineCount}`, `{meta:key}`
- Swap image layout setting
- Glob pattern support in exclusion list
- Configurable "no file open" text

### v1.3.5
- Sentence case fixes in all UI strings (Obsidian marketplace compliance)

### v1.3.0
- Pause mode (status bar, settings button, command palette)
- Idle detection with configurable timeout and action
- Exclusion list for private files/folders
- Custom status format with placeholders

### v1.2.0
- Live connection status in settings tab (🟢/🔴)
- Reconnect button and command palette entry
- Up to 2 configurable profile buttons

### v1.1.0
- Initial public release

---

> Inspired by [obsidian-discordrpc](https://github.com/lukeleppan/obsidian-discordrpc) by [lukeleppan](https://github.com/lukeleppan) (MIT). Rewritten from scratch as the original has not been maintained since 2022.
