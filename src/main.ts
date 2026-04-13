import { MarkdownView, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, PresenceSettings } from "./types";
import { RpcManager } from "./rpcManager";
import { PresenceSettingTab } from "./settingsTab";

export default class ObsidianPresencePlugin extends Plugin {
  settings: PresenceSettings = DEFAULT_SETTINGS;
  private rpcManager!: RpcManager;
  private pluginStartTime = 0;
  private fileStartTime = 0;
  private currentFile: string | null = null;
  private currentMode: "source" | "preview" = "source";
  private statusBarItem!: HTMLElement;

  async onload() {
    await this.loadSettings();

    this.pluginStartTime = Date.now();
    this.fileStartTime = Date.now();

    this.rpcManager = new RpcManager(
      () => {
        this.setStatusBar(true);
        this.updateActivity();
      },
      () => this.setStatusBar(false),
    );

    // Status bar
    this.statusBarItem = this.addStatusBarItem();
    this.statusBarItem.addClass("obsidian-presence-statusbar");
    this.statusBarItem.style.cursor = "pointer";
    this.setStatusBar(false);
    this.registerDomEvent(this.statusBarItem, "click", () => {
      if (!this.rpcManager.connected) {
        this.reconnect();
      }
    });

    // Track file opens
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        this.currentFile = file?.name ?? null;
        if (this.settings.usePerFileTimer) {
          this.fileStartTime = Date.now();
        }
        this.updateActivity();
      })
    );

    // Track edit/preview mode
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view) {
          const mode = view.getMode();
          this.currentMode = mode === "preview" ? "preview" : "source";
          this.updateActivity();
        }
      })
    );

    this.addSettingTab(new PresenceSettingTab(this.app, this));

    // Connect and auto-reconnect every 15s
    this.reconnect();
    this.registerInterval(
      window.setInterval(() => {
        if (!this.rpcManager.connected) {
          this.reconnect();
        }
      }, 15_000)
    );
  }

  onunload() {
    this.rpcManager.destroy();
  }

  reconnect(): void {
    this.rpcManager.connect(this.settings);
  }

  updateActivity(): void {
    const { settings } = this;

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

    const vaultName = settings.showVaultName
      ? (settings.customVaultName.trim() || this.app.vault.getName())
      : null;
    const modeLabel = this.currentMode === "preview" ? "Reading" : "Editing";
    const state = vaultName ? `${modeLabel} in ${vaultName}` : modeLabel;

    const startTimestamp = settings.usePerFileTimer
      ? this.fileStartTime
      : this.pluginStartTime;

    this.rpcManager.setActivity(details, state, startTimestamp, this.currentMode);
  }

  private setStatusBar(connected: boolean): void {
    this.statusBarItem.empty();
    const dot = this.statusBarItem.createSpan();
    dot.setText("⬤ Discord");
    dot.style.color = connected ? "var(--color-green)" : "var(--color-red)";
    dot.title = connected
      ? "Connected to Discord"
      : "Not connected to Discord — click to reconnect";
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
