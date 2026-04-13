import {
  App,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  WorkspaceLeaf,
} from "obsidian";
import * as DiscordRPC from "discord-rpc";

const CLIENT_ID = "1493243390911844574";

interface PresenceSettings {
  showVaultName: boolean;
  showFileName: boolean;
  showFileExtension: boolean;
  usePerFileTimer: boolean;
  customVaultName: string;
  showConnectionNotices: boolean;
}

const DEFAULT_SETTINGS: PresenceSettings = {
  showVaultName: true,
  showFileName: true,
  showFileExtension: true,
  usePerFileTimer: false,
  customVaultName: "",
  showConnectionNotices: true,
};

export default class ObsidianPresencePlugin extends Plugin {
  settings: PresenceSettings = DEFAULT_SETTINGS;
  rpc: DiscordRPC.Client | null = null;
  connected = false;
  pluginStartTime = 0;
  fileStartTime = 0;
  currentFile: string | null = null;
  currentMode: "source" | "preview" = "source";
  statusBarItem!: HTMLElement;

  async onload() {
    await this.loadSettings();

    this.pluginStartTime = Date.now();
    this.fileStartTime = Date.now();

    // Status bar item
    this.statusBarItem = this.addStatusBarItem();
    this.statusBarItem.addClass("obsidian-presence-statusbar");
    this.statusBarItem.style.cursor = "pointer";
    this.setStatusBar(false);
    this.registerDomEvent(this.statusBarItem, "click", () => {
      if (!this.connected) {
        this.connectDiscord();
      }
    });

    // Track file opens
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        if (file) {
          this.currentFile = file.name;
          if (this.settings.usePerFileTimer) {
            this.fileStartTime = Date.now();
          }
        } else {
          this.currentFile = null;
        }
        this.setActivity();
      })
    );

    // Track edit/preview mode changes
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        const leaf = this.app.workspace.activeLeaf;
        if (leaf) {
          this.currentMode = this.detectMode(leaf);
          this.setActivity();
        }
      })
    );

    this.addSettingTab(new PresenceSettingTab(this.app, this));

    // Connect and start auto-reconnect interval
    this.connectDiscord();
    this.registerInterval(
      window.setInterval(() => {
        if (!this.connected) {
          this.connectDiscord();
        }
      }, 15000)
    );
  }

  onunload() {
    this.destroyRpc();
  }

  private detectMode(leaf: WorkspaceLeaf): "source" | "preview" {
    const state = leaf.getViewState();
    const mode = state?.state?.mode;
    return mode === "preview" ? "preview" : "source";
  }

  private setStatusBar(connected: boolean) {
    this.statusBarItem.empty();
    const dot = this.statusBarItem.createSpan();
    dot.setText("⬤ Discord");
    dot.style.color = connected ? "var(--color-green)" : "var(--color-red)";
    if (!connected) {
      dot.title = "Not connected to Discord — click to reconnect";
    } else {
      dot.title = "Connected to Discord";
    }
  }

  connectDiscord() {
    // Clean up any existing client first
    this.destroyRpc();

    DiscordRPC.register(CLIENT_ID);
    const client = new DiscordRPC.Client({ transport: "ipc" });
    this.rpc = client;

    client.on("ready", () => {
      this.connected = true;
      this.setStatusBar(true);
      if (this.settings.showConnectionNotices) {
        new Notice("Discord Rich Presence connected.");
      }
      this.setActivity();
    });

    client.login({ clientId: CLIENT_ID }).catch((err: Error) => {
      this.connected = false;
      this.setStatusBar(false);
      console.debug("[obsidian-presence] Could not connect to Discord:", err.message);
    });
  }

  private destroyRpc() {
    if (this.rpc) {
      try {
        this.rpc.destroy();
      } catch {
        // ignore errors on destroy
      }
      this.rpc = null;
    }
    this.connected = false;
    this.setStatusBar(false);
  }

  setActivity() {
    if (!this.connected || !this.rpc) return;

    const { settings } = this;

    // Build details line (file info)
    let details: string;
    if (settings.showFileName && this.currentFile) {
      if (settings.showFileExtension) {
        details = this.currentFile;
      } else {
        const dotIndex = this.currentFile.lastIndexOf(".");
        details = dotIndex > 0 ? this.currentFile.slice(0, dotIndex) : this.currentFile;
      }
    } else if (this.currentFile) {
      details = "Editing a file";
    } else {
      details = "No file open";
    }

    // Build state line (vault + mode)
    const vaultName = settings.showVaultName
      ? (settings.customVaultName.trim() || this.app.vault.getName())
      : null;
    const modeLabel = this.currentMode === "preview" ? "Reading" : "Editing";
    const state = vaultName ? `${modeLabel} in ${vaultName}` : modeLabel;

    // Timer
    const startTimestamp = settings.usePerFileTimer
      ? this.fileStartTime
      : this.pluginStartTime;

    this.rpc
      .setActivity({
        details,
        state,
        startTimestamp,
        largeImageKey: "obsidian",
        largeImageText: "Obsidian",
      })
      .catch((err: Error) => {
        console.debug("[obsidian-presence] setActivity error:", err.message);
        this.connected = false;
        this.setStatusBar(false);
      });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class PresenceSettingTab extends PluginSettingTab {
  plugin: ObsidianPresencePlugin;

  constructor(app: App, plugin: ObsidianPresencePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Obsidian Presence Settings" });

    // Show vault name toggle
    new Setting(containerEl)
      .setName("Show vault name")
      .setDesc("Display your vault name in Discord status.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showVaultName).onChange(async (value) => {
          this.plugin.settings.showVaultName = value;
          await this.plugin.saveSettings();
          this.display();
          this.plugin.setActivity();
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
              this.plugin.setActivity();
            })
        );
    }

    // Show file name toggle
    new Setting(containerEl)
      .setName("Show file name")
      .setDesc("Display the current file name in Discord status.")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showFileName).onChange(async (value) => {
          this.plugin.settings.showFileName = value;
          await this.plugin.saveSettings();
          this.display();
          this.plugin.setActivity();
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
            this.plugin.setActivity();
          })
        );
    }

    // Per-file timer toggle
    new Setting(containerEl)
      .setName("Per-file timer")
      .setDesc(
        "When on: timer resets each time you open a new file. When off: timer shows total time since Obsidian was opened."
      )
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.usePerFileTimer).onChange(async (value) => {
          this.plugin.settings.usePerFileTimer = value;
          await this.plugin.saveSettings();
          this.plugin.setActivity();
        })
      );

    // Connection notices toggle
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
