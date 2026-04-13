---
title: Custom Discord App
---

# Custom Discord Application

[← Back](index)

By default Obsidian Presence uses a shared Discord Application with the Obsidian logo. If you want your own images, name, or branding in the Rich Presence display, you can create your own Discord Application in minutes.

## Step-by-step

### 1. Create a Discord Application

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application**
3. Give it a name — this name appears in Discord as **"Playing [name]"**
4. Click **Create**

### 2. Upload your assets

1. In your application, go to **Rich Presence → Art Assets**
2. Upload the following images (PNG, minimum 512×512px recommended):

| Key name | Used for |
|---|---|
| `obsidian` | Main large image |
| `editing` | Small icon when in Edit mode |
| `reading` | Small icon when in Preview/Reading mode |

> The key names must match exactly — these are what the plugin uses internally.

3. Click **Save Changes** and wait a few minutes for the assets to propagate

### 3. Copy your Client ID

1. Go to **OAuth2** (or the main page of your application)
2. Copy the **Application ID** (also called Client ID)

### 4. Enter it in the plugin

1. In Obsidian: **Settings → Community Plugins → Obsidian Presence**
2. Paste your Client ID into the **Discord Client ID** field
3. The plugin reconnects automatically with your new application

## Result

Your Discord status will now show your custom application name and images instead of the defaults.
