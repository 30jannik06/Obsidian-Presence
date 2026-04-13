---
title: Installation
---

# Installation

[← Back](index)

## Manual Installation

> Use a dedicated development vault — not your main personal vault.

1. Create a new empty vault in Obsidian
2. Clone the repo into the vault's plugin directory:

```bash
mkdir .obsidian\plugins
cd .obsidian\plugins
git clone https://github.com/30jannik06/obsidian-presence.git
cd obsidian-presence
```

3. Install dependencies and build:

```bash
pnpm install
pnpm run build
```

4. In Obsidian: **Settings → Community Plugins → turn off Restricted Mode → enable Obsidian Presence**

5. Make sure Discord is running — the status bar should turn green within a few seconds.

## Development

```bash
pnpm run dev   # watch mode with inline sourcemaps
pnpm run build # production build (minified)
```

## Updating

```bash
git pull
pnpm run build
```

Then reload Obsidian.
