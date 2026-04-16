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
          .onClick(() => {
            this.plugin.settings.paused = !this.plugin.settings.paused;
            void this.plugin.saveSettings();
            this.plugin.updateActivity();
            this.display();
          });
      });

    // Custom client ID
    new Setting(containerEl)
      .setName("Discord client ID")
      .setDesc(
        "Your Discord application client ID. Leave empty to use the default. " +
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
          .onChange((value) => {
            this.plugin.settings.clientId = value.trim() || DEFAULT_CLIENT_ID;
            void this.plugin.saveSettings();
            this.plugin.reconnect();
          })
      );

    // Show vault name
    new Setting(containerEl)
      .setName("Show vault name")
      .setDesc("Display your vault name in Discord status.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showVaultName).onChange((value) => {
          this.plugin.settings.showVaultName = value;
          void this.plugin.saveSettings();
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
            .onChange((value) => {
              this.plugin.settings.customVaultName = value;
              void this.plugin.saveSettings();
              this.plugin.updateActivity();
            })
        );
    }

    // Show file name
    new Setting(containerEl)
      .setName("Show file name")
      .setDesc("Display the current file name in Discord status.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showFileName).onChange((value) => {
          this.plugin.settings.showFileName = value;
          void this.plugin.saveSettings();
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
          toggle.setValue(this.plugin.settings.showFileExtension).onChange((value) => {
            this.plugin.settings.showFileExtension = value;
            void this.plugin.saveSettings();
            this.plugin.updateActivity();
          })
        );
    }

    // Per-file timer
    new Setting(containerEl)
      .setName("Per-file timer")
      .setDesc(
        "When on: timer resets each time you open a new file. " +
        "When off: timer shows total time since the plugin was loaded."
      )
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.usePerFileTimer).onChange((value) => {
          this.plugin.settings.usePerFileTimer = value;
          void this.plugin.saveSettings();
          this.plugin.updateActivity();
        })
      );

    // Connection notices
    new Setting(containerEl)
      .setName("Show connection notices")
      .setDesc("Show a notice when the plugin connects to Discord.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showConnectionNotices).onChange((value) => {
          this.plugin.settings.showConnectionNotices = value;
          void this.plugin.saveSettings();
        })
      );

    // ── Custom status format ───────────────────────────────────────────────
    new Setting(containerEl)
      .setName("Custom status format")
      .setDesc(
        "Override the text shown in Discord. Leave empty to use the default. " +
        "Available placeholders: {file}, {fileNoExt}, {vault}, {mode}"
      )
      .setHeading();

    new Setting(containerEl)
      .setName("Details format")
      .setDesc("Top line on the Discord status (e.g. \"Editing {fileNoExt}\").")
      .addText((text) =>
        text
          .setPlaceholder("Editing {fileNoExt}")
          .setValue(this.plugin.settings.customDetailsFormat)
          .onChange((value) => {
            this.plugin.settings.customDetailsFormat = value;
            void this.plugin.saveSettings();
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
          .onChange((value) => {
            this.plugin.settings.customStateFormat = value;
            void this.plugin.saveSettings();
            this.plugin.updateActivity();
          })
      );

    // ── Exclusion list ─────────────────────────────────────────────────────
    new Setting(containerEl)
      .setName("Exclusion list")
      .setDesc(
        "Files or folders whose paths contain any of these patterns will be hidden from Discord " +
        "(one pattern per line, e.g. Privat/ or secret.md)."
      )
      .setHeading();

    new Setting(containerEl)
      .setName("Excluded patterns")
      .addTextArea((area) =>
        area
          .setPlaceholder("Privat/\nJournal/\nsecret.md")
          .setValue(this.plugin.settings.excludePatterns)
          .onChange((value) => {
            this.plugin.settings.excludePatterns = value;
            void this.plugin.saveSettings();
            this.plugin.updateActivity();
          })
      );

    // ── Idle detection ─────────────────────────────────────────────────────
    new Setting(containerEl)
      .setName("Idle detection")
      .setHeading();

    new Setting(containerEl)
      .setName("Enable idle detection")
      .setDesc("Automatically change or clear your presence after a period of inactivity.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.idleDetectionEnabled).onChange((value) => {
          this.plugin.settings.idleDetectionEnabled = value;
          void this.plugin.saveSettings();
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
            .onChange((value) => {
              const parsed = parseInt(value, 10);
              if (!isNaN(parsed) && parsed > 0) {
                this.plugin.settings.idleTimeoutMinutes = parsed;
                void this.plugin.saveSettings();
              }
            })
        );

      new Setting(containerEl)
        .setName("When idle")
        .setDesc("What to show on Discord when you are idle.")
        .addDropdown((drop) =>
          drop
            .addOption("afk", "Away from keyboard")
            .addOption("clear", "Clear presence entirely")
            .setValue(this.plugin.settings.idleAction)
            .onChange((value) => {
              this.plugin.settings.idleAction = value as "afk" | "clear";
              void this.plugin.saveSettings();
            })
        );
    }

    // ── Profile buttons ────────────────────────────────────────────────────
    new Setting(containerEl)
      .setName("Profile buttons")
      .setDesc("Up to 2 buttons shown on your Discord profile. Leave label or URL empty to disable a button.")
      .setHeading();

    for (let i = 0; i < 2; i++) {
      const btn = this.plugin.settings.buttons[i];

      new Setting(containerEl)
        .setName(`Button ${i + 1} label`)
        .setDesc("Text shown on the button (max 32 characters).")
        .addText((text) =>
          text
            .setPlaceholder(i === 0 ? "View repository" : "My website")
            .setValue(btn.label)
            .onChange((value) => {
              this.plugin.settings.buttons[i].label = value.slice(0, 32);
              void this.plugin.saveSettings();
              this.plugin.updateActivity();
            })
        );

      new Setting(containerEl)
        .setName(`Button ${i + 1} URL`)
        .setDesc("Must start with https://; leave empty to disable.")
        .addText((text) =>
          text
            .setPlaceholder("https://github.com/yourname/yourrepo")
            .setValue(btn.url)
            .onChange((value) => {
              const trimmed = value.trim();
              if (trimmed && !trimmed.startsWith("https://")) {
                new Notice("URL must start with https://");
              }
              this.plugin.settings.buttons[i].url = trimmed;
              void this.plugin.saveSettings();
              this.plugin.updateActivity();
            })
        );
    }
  }
}
