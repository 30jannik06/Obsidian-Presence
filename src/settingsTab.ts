import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type ObsidianPresencePlugin from "./main";
import { DEFAULT_CLIENT_ID } from "./types";

export class PresenceSettingTab extends PluginSettingTab {
  plugin: ObsidianPresencePlugin;

  constructor(app: App, plugin: ObsidianPresencePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Obsidian Presence Settings" });

    // Connection status + reconnect + pause
    new Setting(containerEl)
      .setName("Discord connection")
      .setDesc(this.plugin.connected ? "🟢 Connected" : "🔴 Not connected")
      .addButton((btn) =>
        btn
          .setButtonText("Reconnect")
          .onClick(() => {
            this.plugin.reconnect();
            btn.setDisabled(true);
            btn.setButtonText("Reconnecting…");
            setTimeout(() => this.display(), 5000);
          })
      )
      .addButton((btn) => {
        const paused = this.plugin.settings.paused;
        btn
          .setButtonText(paused ? "Resume" : "Pause")
          .setCta()
          .onClick(async () => {
            this.plugin.settings.paused = !this.plugin.settings.paused;
            await this.plugin.saveSettings();
            this.plugin.updateActivity();
            this.display();
          });
      });

    // Custom Client ID
    new Setting(containerEl)
      .setName("Discord Client ID")
      .setDesc(
        "Your Discord Application Client ID. Leave empty to use the default. " +
        "Create your own app at discord.com/developers/applications for custom images and branding."
      )
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_CLIENT_ID)
          .setValue(
            this.plugin.settings.clientId === DEFAULT_CLIENT_ID
              ? ""
              : this.plugin.settings.clientId
          )
          .onChange(async (value) => {
            this.plugin.settings.clientId = value.trim() || DEFAULT_CLIENT_ID;
            await this.plugin.saveSettings();
            this.plugin.reconnect();
          })
      );

    // Show vault name
    new Setting(containerEl)
      .setName("Show vault name")
      .setDesc("Display your vault name in Discord status.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showVaultName).onChange(async (value) => {
          this.plugin.settings.showVaultName = value;
          await this.plugin.saveSettings();
          this.display();
          this.plugin.updateActivity();
        })
      );

    // Custom vault name (only when showVaultName is on)
    if (this.plugin.settings.showVaultName) {
      new Setting(containerEl)
        .setName("Custom vault name")
        .setDesc("Override the vault name shown in Discord. Leave empty to use the real vault name.")
        .addText((text) =>
          text
            .setPlaceholder(this.app.vault.getName())
            .setValue(this.plugin.settings.customVaultName)
            .onChange(async (value) => {
              this.plugin.settings.customVaultName = value;
              await this.plugin.saveSettings();
              this.plugin.updateActivity();
            })
        );
    }

    // Show file name
    new Setting(containerEl)
      .setName("Show file name")
      .setDesc("Display the current file name in Discord status.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showFileName).onChange(async (value) => {
          this.plugin.settings.showFileName = value;
          await this.plugin.saveSettings();
          this.display();
          this.plugin.updateActivity();
        })
      );

    // Show file extension (only when showFileName is on)
    if (this.plugin.settings.showFileName) {
      new Setting(containerEl)
        .setName("Show file extension")
        .setDesc("Include the file extension (e.g. .md) in the file name.")
        .addToggle((toggle) =>
          toggle.setValue(this.plugin.settings.showFileExtension).onChange(async (value) => {
            this.plugin.settings.showFileExtension = value;
            await this.plugin.saveSettings();
            this.plugin.updateActivity();
          })
        );
    }

    // Per-file timer
    new Setting(containerEl)
      .setName("Per-file timer")
      .setDesc(
        "When on: timer resets each time you open a new file. " +
        "When off: timer shows total time since Obsidian was opened."
      )
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.usePerFileTimer).onChange(async (value) => {
          this.plugin.settings.usePerFileTimer = value;
          await this.plugin.saveSettings();
          this.plugin.updateActivity();
        })
      );

    // Connection notices
    new Setting(containerEl)
      .setName("Show connection notices")
      .setDesc("Show a notice when Discord Rich Presence connects.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showConnectionNotices).onChange(async (value) => {
          this.plugin.settings.showConnectionNotices = value;
          await this.plugin.saveSettings();
        })
      );

    // ── Custom Status Format ───────────────────────────────────────────────
    containerEl.createEl("h3", { text: "Custom Status Format" });
    containerEl.createEl("p", {
      text: "Override the text shown in Discord. Leave empty to use the default. " +
        "Available placeholders: {file}, {fileNoExt}, {vault}, {mode}",
      cls: "setting-item-description",
    });

    new Setting(containerEl)
      .setName("Details format")
      .setDesc("Top line on the Discord status (e.g. \"Editing {fileNoExt}\").")
      .addText((text) =>
        text
          .setPlaceholder("Editing {fileNoExt}")
          .setValue(this.plugin.settings.customDetailsFormat)
          .onChange(async (value) => {
            this.plugin.settings.customDetailsFormat = value;
            await this.plugin.saveSettings();
            this.plugin.updateActivity();
          })
      );

    new Setting(containerEl)
      .setName("State format")
      .setDesc("Bottom line on the Discord status (e.g. \"{mode} in {vault}\").")
      .addText((text) =>
        text
          .setPlaceholder("{mode} in {vault}")
          .setValue(this.plugin.settings.customStateFormat)
          .onChange(async (value) => {
            this.plugin.settings.customStateFormat = value;
            await this.plugin.saveSettings();
            this.plugin.updateActivity();
          })
      );

    // ── Exclusion List ─────────────────────────────────────────────────────
    containerEl.createEl("h3", { text: "Exclusion List" });
    containerEl.createEl("p", {
      text: "Files or folders whose paths contain any of these patterns will be hidden from Discord (one pattern per line). " +
        "Example: Privat/ or secret.md",
      cls: "setting-item-description",
    });

    new Setting(containerEl)
      .setName("Excluded patterns")
      .addTextArea((area) =>
        area
          .setPlaceholder("Privat/\nJournal/\nsecret.md")
          .setValue(this.plugin.settings.excludePatterns)
          .onChange(async (value) => {
            this.plugin.settings.excludePatterns = value;
            await this.plugin.saveSettings();
            this.plugin.updateActivity();
          })
      );

    // ── Idle Detection ─────────────────────────────────────────────────────
    containerEl.createEl("h3", { text: "Idle Detection" });

    new Setting(containerEl)
      .setName("Enable idle detection")
      .setDesc("Automatically change or clear your presence after a period of inactivity.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.idleDetectionEnabled).onChange(async (value) => {
          this.plugin.settings.idleDetectionEnabled = value;
          await this.plugin.saveSettings();
          this.display();
        })
      );

    if (this.plugin.settings.idleDetectionEnabled) {
      new Setting(containerEl)
        .setName("Idle timeout (minutes)")
        .setDesc("How long to wait before marking you as idle.")
        .addText((text) =>
          text
            .setPlaceholder("10")
            .setValue(String(this.plugin.settings.idleTimeoutMinutes))
            .onChange(async (value) => {
              const parsed = parseInt(value, 10);
              if (!isNaN(parsed) && parsed > 0) {
                this.plugin.settings.idleTimeoutMinutes = parsed;
                await this.plugin.saveSettings();
              }
            })
        );

      new Setting(containerEl)
        .setName("When idle")
        .setDesc("What to show on Discord when you are idle.")
        .addDropdown((drop) =>
          drop
            .addOption("afk", "Show \"Away from keyboard\"")
            .addOption("clear", "Clear presence entirely")
            .setValue(this.plugin.settings.idleAction)
            .onChange(async (value) => {
              this.plugin.settings.idleAction = value as "afk" | "clear";
              await this.plugin.saveSettings();
            })
        );
    }

    // ── Profile Buttons ────────────────────────────────────────────────────
    containerEl.createEl("h3", { text: "Profile Buttons" });
    containerEl.createEl("p", {
      text: "Up to 2 buttons shown on your Discord profile. Leave label or URL empty to disable a button. URL must start with https://",
      cls: "setting-item-description",
    });

    for (let i = 0; i < 2; i++) {
      const btn = this.plugin.settings.buttons[i];

      new Setting(containerEl)
        .setName(`Button ${i + 1} label`)
        .setDesc("Text shown on the button (max 32 characters).")
        .addText((text) =>
          text
            .setPlaceholder(i === 0 ? "View Repository" : "My Website")
            .setValue(btn.label)
            .onChange(async (value) => {
              this.plugin.settings.buttons[i].label = value.slice(0, 32);
              await this.plugin.saveSettings();
              this.plugin.updateActivity();
            })
        );

      new Setting(containerEl)
        .setName(`Button ${i + 1} URL`)
        .setDesc("Must start with https://")
        .addText((text) =>
          text
            .setPlaceholder("https://github.com/yourname/yourrepo")
            .setValue(btn.url)
            .onChange(async (value) => {
              const trimmed = value.trim();
              if (trimmed && !trimmed.startsWith("https://")) {
                new Notice("Button URL must start with https://");
              }
              this.plugin.settings.buttons[i].url = trimmed;
              await this.plugin.saveSettings();
              this.plugin.updateActivity();
            })
        );
    }
  }
}
