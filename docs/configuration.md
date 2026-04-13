---
title: Configuration
---

# Configuration

[← Back](index)

All settings are found under **Settings → Community Plugins → Obsidian Presence**.

## Settings

### Discord Client ID
Your own Discord Application Client ID. Leave this empty to use the default (Obsidian logo included).

If you want custom images or your own branding, see [Custom Discord App](custom-app).

---

### Show vault name
Toggles whether your vault name appears in the Discord status.

**On:** `Editing in MyVault`
**Off:** `Editing`

---

### Custom vault name
Override the vault name shown in Discord. Useful if your vault folder has a technical name but you want something nicer displayed.

Leave empty to use the actual vault name.

---

### Show file name
Toggles whether the currently open file name appears in Discord.

**On:** `main.ts`
**Off:** `Editing a file`

---

### Show file extension
Toggles whether the file extension (e.g. `.md`) is included in the file name.

**On:** `My Note.md`
**Off:** `My Note`

Only visible when **Show file name** is enabled.

---

### Per-file timer
Controls what the elapsed timer counts.

**On:** Timer resets every time you open a new file
**Off:** Timer counts from when Obsidian was opened (default)

---

### Show connection notices
Shows an Obsidian notice when Discord Rich Presence successfully connects.

## Status Bar

The **⬤ Discord** indicator in the bottom status bar shows the connection state:

| Color | Meaning |
|---|---|
| Green | Connected to Discord |
| Red | Not connected — click to reconnect |
