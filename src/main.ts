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
	private currentFilePath: string | null = null;
	private currentMode: "source" | "preview" = "source";
	private currentFileType: "md" | "canvas" | "other" = "md";
	private statusBarItem!: HTMLElement;
	private lastInteractionTime = 0;
	private lastReconnectAttempt = 0;
	private readonly reconnectCooldownMs = 5000;
	settingsTab: PresenceSettingTab | null = null;

	async onload() {
		await this.loadSettings();

		this.pluginStartTime = Date.now();
		this.fileStartTime = Date.now();
		this.lastInteractionTime = Date.now();

		this.rpcManager = new RpcManager(
			() => {
				this.setStatusBar(true);
				this.updateActivity();
				this.settingsTab?.refresh();
			},
			() => {
				this.setStatusBar(false);
				this.settingsTab?.refresh();
			}
		);

		// Status bar
		this.statusBarItem = this.addStatusBarItem();
		this.statusBarItem.addClass("obsidian-presence-statusbar");
		this.setStatusBar(false);
		this.registerDomEvent(this.statusBarItem, "click", () => {
			if (this.settings.paused) {
				this.setPaused(false);
			} else if (this.rpcManager.connected) {
				this.setPaused(true);
			} else {
				this.reconnect();
			}
		});

		// Track file opens (including .canvas files)
		this.registerEvent(
			this.app.workspace.on("file-open", (file) => {
				this.currentFile = file?.name ?? null;
				this.currentFilePath = file?.path ?? null;
				this.currentFileType =
					file?.extension === "canvas"
						? "canvas"
						: file?.extension === "md"
							? "md"
							: "other";
				if (this.currentFileType !== "md") {
					this.currentMode = "source";
				}
				this.lastInteractionTime = Date.now();
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
					this.lastInteractionTime = Date.now();
					this.updateActivity();
				}
			})
		);

		// Track typing (for idle detection)
		this.registerEvent(
			this.app.workspace.on("editor-change", () => {
				this.lastInteractionTime = Date.now();
			})
		);

		this.settingsTab = new PresenceSettingTab(this.app, this);
		this.addSettingTab(this.settingsTab);

		this.addCommand({
			id: "reconnect-discord",
			name: "Reconnect to Discord",
			callback: () => this.reconnect(),
		});

		this.addCommand({
			id: "toggle-pause",
			name: "Toggle presence pause",
			callback: () => this.setPaused(!this.settings.paused),
		});

		// Connect and auto-reconnect every 15s + idle check
		this.reconnect();
		this.registerInterval(
			window.setInterval(() => {
				if (!this.rpcManager.connected && !this.settings.paused) {
					this.reconnect();
				}
				if (
					this.settings.idleDetectionEnabled &&
					this.rpcManager.connected &&
					!this.settings.paused
				) {
					const idleMs = this.settings.idleTimeoutMinutes * 60_000;
					if (Date.now() - this.lastInteractionTime > idleMs) {
						if (this.settings.idleAction === "afk") {
							this.rpcManager.setActivity(
								"Away from keyboard",
								"AFK",
								this.pluginStartTime,
								this.currentMode,
								[]
							);
						} else {
							this.rpcManager.clearActivity();
						}
					}
				}
			}, 15_000)
		);
	}

	onunload() {
		this.rpcManager.destroy();
	}

	get connected(): boolean {
		return this.rpcManager.connected;
	}

	setPaused(paused: boolean): void {
		this.settings.paused = paused;
		void this.saveSettings();
		this.setStatusBar(this.rpcManager.connected);
		if (paused) {
			this.rpcManager.clearActivity();
		} else {
			this.updateActivity();
		}
		this.settingsTab?.refresh();
	}

	reconnect(): void {
		const now = Date.now();
		if (now - this.lastReconnectAttempt < this.reconnectCooldownMs) return;
		this.lastReconnectAttempt = now;
		this.rpcManager.connect(this.settings);
	}

	updateActivity(): void {
		this.lastInteractionTime = Date.now();

		if (this.settings.paused) {
			this.rpcManager.clearActivity();
			return;
		}

		if (this.isExcluded(this.currentFilePath)) {
			this.rpcManager.clearActivity();
			return;
		}

		const { settings } = this;
		const modeLabel = this.currentMode === "preview" ? "Reading" : "Editing";

		let details: string;
		if (settings.customDetailsFormat) {
			details = this.applyFormat(settings.customDetailsFormat);
		} else if (settings.showFileName && this.currentFile) {
			if (settings.showFileExtension) {
				details = this.currentFile;
			} else {
				const dotIndex = this.currentFile.lastIndexOf(".");
				details = dotIndex > 0 ? this.currentFile.slice(0, dotIndex) : this.currentFile;
			}
		} else if (this.currentFile) {
			details = "Editing a file";
		} else {
			details = settings.noFileText || "No file open";
		}

		let state: string;
		if (settings.customStateFormat) {
			state = this.applyFormat(settings.customStateFormat);
		} else {
			const vaultName = settings.showVaultName
				? settings.customVaultName.trim() || this.app.vault.getName()
				: null;
			state = vaultName ? `${modeLabel} in ${vaultName}` : modeLabel;
		}

		const startTimestamp = settings.usePerFileTimer ? this.fileStartTime : this.pluginStartTime;

		this.rpcManager.setActivity(
			details,
			state,
			startTimestamp,
			this.currentMode,
			this.settings.buttons,
			this.settings.swapImages
		);
	}

	private globToRegex(pattern: string): RegExp {
		const reStr = pattern
			.split("**")
			.map((part) =>
				part
					.replace(/[.+^${}()|[\]\\]/g, "\\$&")
					.replace(/\*/g, "[^/]*")
					.replace(/\?/g, "[^/]")
			)
			.join(".*");
		return new RegExp(reStr);
	}

	private isExcluded(filePath: string | null): boolean {
		if (!filePath || !this.settings.excludePatterns.trim()) return false;
		const patterns = this.settings.excludePatterns
			.split("\n")
			.map((p) => p.trim())
			.filter(Boolean);
		return patterns.some((p) =>
			p.includes("*") || p.includes("?")
				? this.globToRegex(p).test(filePath)
				: filePath.includes(p)
		);
	}

	private applyFormat(template: string): string {
		const vaultName = this.settings.customVaultName.trim() || this.app.vault.getName();
		const modeLabel = this.currentMode === "preview" ? "Reading" : "Editing";
		const fileName = this.currentFile ?? "";
		const dotIndex = fileName.lastIndexOf(".");
		const fileNoExt = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
		const folder =
			this.currentFilePath && this.currentFilePath.includes("/")
				? this.currentFilePath.substring(0, this.currentFilePath.lastIndexOf("/"))
				: "";

		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
		const content = editor?.getValue() ?? "";
		const wordCount = String(content.trim() ? content.trim().split(/\s+/).length : 0);
		const lineCount = String(content ? content.split("\n").length : 0);

		const activeFile = this.app.workspace.getActiveFile();
		const frontmatter: Record<string, unknown> = activeFile
			? (this.app.metadataCache.getFileCache(activeFile)?.frontmatter ?? {})
			: {};

		return template
			.replace(/{file}/g, fileName)
			.replace(/{fileNoExt}/g, fileNoExt)
			.replace(/{vault}/g, vaultName)
			.replace(/{mode}/g, modeLabel)
			.replace(/{folder}/g, folder)
			.replace(/{wordCount}/g, wordCount)
			.replace(/{lineCount}/g, lineCount)
			.replace(/{meta:(\w+)}/g, (_, key: string) => this.formatMeta(frontmatter[key]));
	}

	private formatMeta(value: unknown): string {
		if (value === null || value === undefined) return "";
		if (Array.isArray(value)) return value.map((v) => this.formatMeta(v)).join(",");
		if (typeof value === "object") return JSON.stringify(value);
		if (typeof value === "string") return value;
		if (typeof value === "number" || typeof value === "boolean") return String(value);
		return "";
	}

	private setStatusBar(connected: boolean): void {
		this.statusBarItem.empty();
		const dot = this.statusBarItem.createSpan();
		if (this.settings.paused) {
			dot.setText("⏸ Discord");
			dot.addClass("obsidian-presence-paused");
			dot.title = "Presence paused — click to resume";
		} else {
			dot.setText("⬤ Discord");
			dot.addClass(
				connected ? "obsidian-presence-connected" : "obsidian-presence-disconnected"
			);
			dot.title = connected
				? "Connected to Discord — click to pause"
				: "Not connected to Discord — click to reconnect";
		}
	}

	async loadSettings() {
		const data = (await this.loadData()) as Partial<PresenceSettings> | null;
		this.settings = Object.assign({}, structuredClone(DEFAULT_SETTINGS), data);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
