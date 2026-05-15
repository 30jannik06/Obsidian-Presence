import * as DiscordRPC from "discord-rpc";
import { Notice } from "obsidian";
import type { PresenceButton, PresenceSettings } from "./types";

export class RpcManager {
	private rpc: DiscordRPC.Client | null = null;
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

		DiscordRPC.register(settings.clientId);
		const client = new DiscordRPC.Client({ transport: "ipc" });
		this.rpc = client;

		client.on("ready", () => {
			this._connected = true;
			this.onConnected();
			if (settings.showConnectionNotices) {
				new Notice("Connected to Discord.");
			}
		});

		client.on("disconnected", () => {
			this._connected = false;
			this.onDisconnected();
		});

		client.login({ clientId: settings.clientId }).catch((err: Error) => {
			this._connected = false;
			this.onDisconnected();
			console.debug("[discord-rpc] Could not connect to Discord:", err.message);
		});
	}

	destroy(): void {
		if (this.rpc) {
			try {
				void this.rpc.destroy();
			} catch {
				// ignore errors on destroy
			}
			this.rpc = null;
		}
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
		if (!this._connected || !this.rpc) return;

		const activeButtons = buttons.filter((b) => b.label.trim() && b.url.startsWith("https://"));
		const modeKey = mode === "preview" ? "reading" : "editing";
		const modeText = mode === "preview" ? "Reading" : "Editing";
		const largeImageKey = swapImages ? modeKey : "obsidian";
		const largeImageText = swapImages ? modeText : "Obsidian";
		const smallImageKey = swapImages ? "obsidian" : modeKey;
		const smallImageText = swapImages ? "Obsidian" : modeText;

		this.rpc
			.setActivity({
				details,
				state,
				startTimestamp,
				largeImageKey,
				largeImageText,
				smallImageKey,
				smallImageText,
				...(activeButtons.length > 0 && { buttons: activeButtons }),
			} as Parameters<DiscordRPC.Client["setActivity"]>[0] & { buttons?: PresenceButton[] })
			.catch((err: Error) => {
				console.debug("[discord-rpc] setActivity error:", err.message);
				this._connected = false;
				this.onDisconnected();
			});
	}

	clearActivity(): void {
		if (!this._connected || !this.rpc) return;
		this.rpc.clearActivity().catch((err: Error) => {
			console.debug("[discord-rpc] clearActivity error:", err.message);
		});
	}
}
