# Obsidian Presence

Show your Obsidian activity on Discord via Rich Presence.

## Features

- Displays your current vault and file name in Discord
- Shows whether you're in Edit or Preview mode
- Elapsed timer (total session or per-file)
- Auto-reconnects if Discord is closed and reopened
- Status bar indicator with click-to-reconnect
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

---

> This plugin is inspired by and based on [obsidian-discordrpc](https://github.com/lukeleppan/obsidian-discordrpc) by [lukeleppan](https://github.com/lukeleppan) (MIT License).
> It was rewritten from scratch because the original has not been maintained since 2022.
