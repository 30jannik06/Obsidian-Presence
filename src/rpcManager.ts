import { Notice } from "obsidian";
import { DiscordIpcClient } from "./discordIpc";
import type { PresenceButton, PresenceSettings } from "./types";

export class RpcManager {
	private client: DiscordIpcClient | null = null;
	private _connected = false;

	constructor(
		private readonly onConnected: () => void,
		private readonly onDisconnected: () => void
	) {}

	get connected(): boolean {
		return this._connected;
	}

	connect(settings: PresenceSettings): void {
		this.destroy();

		const client = new DiscordIpcClient(settings.clientId, () => {
			if (this.client !== client) return;
			this.client = null;
			this._connected = false;
			this.onDisconnected();
		});
		this.client = client;

		client
			.connect()
			.then(() => {
				if (this.client !== client) {
					client.destroy();
					return;
				}
				this._connected = true;
				this.onConnected();
				if (settings.showConnectionNotices) {
					new Notice("Connected to Discord.");
				}
			})
			.catch((err: Error) => {
				if (this.client !== client) return;
				this.client = null;
				this._connected = false;
				this.onDisconnected();
				console.debug("[discord-rpc] Could not connect to Discord:", err.message);
			});
	}

	destroy(): void {
		this.client?.destroy();
		this.client = null;
		this._connected = false;
	}

	setActivity(
		details: string,
		state: string,
		startTimestamp: number,
		mode: "source" | "preview",
		buttons: PresenceButton[],
		swapImages = false
	): void {
		if (!this._connected || !this.client) return;

		const activeButtons = buttons.filter((b) => b.label.trim() && b.url.startsWith("https://"));
		const modeKey = mode === "preview" ? "reading" : "editing";
		const modeText = mode === "preview" ? "Reading" : "Editing";

		this.client
			.setActivity({
				details,
				state,
				timestamps: { start: startTimestamp },
				assets: {
					large_image: swapImages ? modeKey : "obsidian",
					large_text: swapImages ? modeText : "Obsidian",
					small_image: swapImages ? "obsidian" : modeKey,
					small_text: swapImages ? "Obsidian" : modeText,
				},
				...(activeButtons.length > 0 && { buttons: activeButtons }),
			})
			.catch((err: Error) => {
				console.debug("[discord-rpc] setActivity error:", err.message);
				this._connected = false;
				this.onDisconnected();
			});
	}

	clearActivity(): void {
		if (!this._connected || !this.client) return;
		this.client.setActivity(null).catch((err: Error) => {
			console.debug("[discord-rpc] clearActivity error:", err.message);
		});
	}
}
