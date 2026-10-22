import * as net from "net";

const OP_HANDSHAKE = 0;
const OP_FRAME = 1;
const OP_CLOSE = 2;
const OP_PING = 3;
const OP_PONG = 4;

const HANDSHAKE_TIMEOUT_MS = 10_000;
const REQUEST_TIMEOUT_MS = 10_000;

export interface DiscordActivity {
	details?: string;
	state?: string;
	timestamps?: { start?: number };
	assets?: {
		large_image?: string;
		large_text?: string;
		small_image?: string;
		small_text?: string;
	};
	buttons?: { label: string; url: string }[];
}

interface IpcMessage {
	cmd?: string;
	evt?: string | null;
	nonce?: string | null;
	data?: { message?: string };
}

interface PendingRequest {
	resolve: () => void;
	reject: (err: Error) => void;
	timer: number;
}

function ipcPaths(): string[] {
	const isWindows = process.platform === "win32";
	const dirs: string[] = [];

	if (isWindows) {
		dirs.push("\\\\?\\pipe");
	} else {
		const bases = [
			process.env.XDG_RUNTIME_DIR,
			process.env.TMPDIR,
			process.env.TMP,
			process.env.TEMP,
			"/tmp",
		].filter((dir): dir is string => !!dir);
		for (const base of new Set(bases)) {
			dirs.push(base, `${base}/app/com.discordapp.Discord`, `${base}/snap.discord`);
		}
	}

	const paths: string[] = [];
	for (const dir of dirs) {
		for (let i = 0; i < 10; i++) {
			paths.push(`${dir}${isWindows ? "\\" : "/"}discord-ipc-${i}`);
		}
	}
	return paths;
}

function tryConnect(path: string): Promise<net.Socket> {
	return new Promise((resolve, reject) => {
		const socket = net.createConnection(path);
		const onError = (err: Error) => {
			socket.destroy();
			reject(err);
		};
		socket.once("error", onError);
		socket.once("connect", () => {
			socket.off("error", onError);
			resolve(socket);
		});
	});
}

/** Minimal Discord Rich Presence client speaking the local IPC protocol. */
export class DiscordIpcClient {
	private socket: net.Socket | null = null;
	private buffer: Buffer = Buffer.alloc(0);
	private readonly pending = new Map<string, PendingRequest>();
	private nonceCounter = 0;
	private closed = false;
	private onReady: (() => void) | null = null;
	private onHandshakeError: ((err: Error) => void) | null = null;

	constructor(
		private readonly clientId: string,
		private readonly onClose: () => void
	) {}

	async connect(): Promise<void> {
		let lastError = new Error("Discord IPC socket not found");
		let socket: net.Socket | null = null;
		for (const path of ipcPaths()) {
			try {
				socket = await tryConnect(path);
				break;
			} catch (err) {
				lastError = err instanceof Error ? err : lastError;
			}
		}
		if (!socket) throw lastError;
		if (this.closed) {
			socket.destroy();
			throw new Error("Client destroyed");
		}

		this.socket = socket;
		socket.on("data", (chunk: Buffer) => this.handleData(chunk));
		socket.on("close", () => this.handleClose());
		socket.on("error", () => {
			// "close" always follows an error and handles the cleanup
		});

		await new Promise<void>((resolve, reject) => {
			const timer = window.setTimeout(() => {
				reject(new Error("Discord handshake timed out"));
			}, HANDSHAKE_TIMEOUT_MS);
			this.onReady = () => {
				window.clearTimeout(timer);
				resolve();
			};
			this.onHandshakeError = (err) => {
				window.clearTimeout(timer);
				reject(err);
			};
			this.send(OP_HANDSHAKE, { v: 1, client_id: this.clientId });
		}).catch((err: unknown) => {
			this.destroy();
			throw err;
		});
	}

	setActivity(activity: DiscordActivity | null): Promise<void> {
		return this.request("SET_ACTIVITY", {
			pid: process.pid,
			activity: activity ?? undefined,
		});
	}

	destroy(): void {
		this.closed = true;
		this.failAll(new Error("Connection closed"));
		this.socket?.destroy();
		this.socket = null;
	}

	private request(cmd: string, args: Record<string, unknown>): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.closed || !this.socket) {
				reject(new Error("Not connected"));
				return;
			}
			const nonce = `${++this.nonceCounter}-${Date.now()}`;
			const timer = window.setTimeout(() => {
				this.pending.delete(nonce);
				reject(new Error("Request timed out"));
			}, REQUEST_TIMEOUT_MS);
			this.pending.set(nonce, { resolve, reject, timer });
			this.send(OP_FRAME, { cmd, args, nonce });
		});
	}

	private send(op: number, payload: unknown): void {
		if (!this.socket) return;
		const body = Buffer.from(JSON.stringify(payload), "utf8");
		const header = Buffer.alloc(8);
		header.writeInt32LE(op, 0);
		header.writeInt32LE(body.length, 4);
		this.socket.write(Buffer.concat([header, body]));
	}

	private handleData(chunk: Buffer): void {
		this.buffer = Buffer.concat([this.buffer, chunk]);
		while (this.buffer.length >= 8) {
			const op = this.buffer.readInt32LE(0);
			const length = this.buffer.readInt32LE(4);
			if (this.buffer.length < 8 + length) return;
			const body = this.buffer.toString("utf8", 8, 8 + length);
			this.buffer = this.buffer.subarray(8 + length);

			let message: IpcMessage = {};
			try {
				message = JSON.parse(body) as IpcMessage;
			} catch {
				continue;
			}
			this.handleMessage(op, message, body);
		}
	}

	private handleMessage(op: number, message: IpcMessage, raw: string): void {
		if (op === OP_PING) {
			this.send(OP_PONG, JSON.parse(raw) as unknown);
			return;
		}

		if (op === OP_CLOSE) {
			this.onHandshakeError?.(
				new Error(message.data?.message ?? "Discord closed the connection")
			);
			this.handleClose();
			return;
		}

		if (message.cmd === "DISPATCH" && message.evt === "READY") {
			this.onReady?.();
			this.onReady = null;
			this.onHandshakeError = null;
			return;
		}

		if (message.evt === "ERROR" && !message.nonce) {
			this.onHandshakeError?.(new Error(message.data?.message ?? "Discord error"));
			return;
		}

		const request = message.nonce ? this.pending.get(message.nonce) : undefined;
		if (!request || !message.nonce) return;
		this.pending.delete(message.nonce);
		window.clearTimeout(request.timer);
		if (message.evt === "ERROR") {
			request.reject(new Error(message.data?.message ?? "Discord error"));
		} else {
			request.resolve();
		}
	}

	private handleClose(): void {
		if (this.closed) return;
		this.closed = true;
		this.failAll(new Error("Connection closed"));
		this.socket?.destroy();
		this.socket = null;
		this.onClose();
	}

	private failAll(err: Error): void {
		for (const request of this.pending.values()) {
			window.clearTimeout(request.timer);
			request.reject(err);
		}
		this.pending.clear();
		this.onHandshakeError?.(err);
		this.onReady = null;
		this.onHandshakeError = null;
	}
}
