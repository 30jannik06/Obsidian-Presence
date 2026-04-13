import { App, PluginSettingTab, Setting } from "obsidian";
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
  }
}
