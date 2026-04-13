import * as DiscordRPC from "discord-rpc";
import { Notice } from "obsidian";
import type { PresenceSettings } from "./types";

export class RpcManager {
  private rpc: DiscordRPC.Client | null = null;
  private _connected = false;

  constructor(
    private readonly onConnected: () => void,
    private readonly onDisconnected: () => void,
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
        new Notice("Discord Rich Presence connected.");
      }
    });

    client.login({ clientId: settings.clientId }).catch((err: Error) => {
      this._connected = false;
      this.onDisconnected();
      console.debug("[obsidian-presence] Could not connect to Discord:", err.message);
    });
  }

  destroy(): void {
    if (this.rpc) {
      try {
        this.rpc.destroy();
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
  ): void {
    if (!this._connected || !this.rpc) return;

    this.rpc
      .setActivity({
        details,
        state,
        startTimestamp,
        largeImageKey: "obsidian",
        largeImageText: "Obsidian",
        smallImageKey: mode === "preview" ? "reading" : "editing",
        smallImageText: mode === "preview" ? "Reading" : "Editing",
      })
      .catch((err: Error) => {
        console.debug("[obsidian-presence] setActivity error:", err.message);
        this._connected = false;
        this.onDisconnected();
      });
  }
}
