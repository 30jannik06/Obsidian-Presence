import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import type { SettingControl, SettingDefinition, SettingDefinitionItem } from "obsidian";
import type ObsidianPresencePlugin from "./main";
import { DEFAULT_CLIENT_ID } from "./types";

type Visibility = boolean | (() => boolean) | undefined;
type Validator = (value: unknown) => string | void | Promise<string | void>;

/** Toggling these changes which other settings are shown. */
const STRUCTURAL_KEYS = new Set(["showVaultName", "showFileName", "idleDetectionEnabled"]);
/** Changing these does not affect the Discord activity text. */
const SILENT_KEYS = new Set(["showConnectionNotices", "idleDetectionEnabled", "idleAction"]);

const PLACEHOLDERS =
	"Placeholders: {file}, {fileNoExt}, {folder}, {vault}, {mode}, {wordCount}, {lineCount}, {meta:key}";

function isShown(visible: Visibility): boolean {
	return typeof visible === "function" ? visible() : (visible ?? true);
}

function asString(value: unknown): string {
	return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export class PresenceSettingTab extends PluginSettingTab {
	plugin: ObsidianPresencePlugin;

	constructor(app: App, plugin: ObsidianPresencePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		const settings = () => this.plugin.settings;

		const buttonRows = [0, 1].flatMap((i): SettingDefinition[] => [
			{
				name: `Button ${i + 1} label`,
				desc: "Text shown on the button (max 32 characters).",
				control: {
					type: "text",
					key: `button${i}Label`,
					placeholder: i === 0 ? "View repository" : "My website",
				},
			},
			{
				name: `Button ${i + 1} URL`,
				desc: "Must start with https://; leave empty to disable.",
				control: {
					type: "text",
					key: `button${i}Url`,
					placeholder: "https://github.com/yourname/yourrepo",
					validate: (value) =>
						value.trim() && !value.trim().startsWith("https://")
							? "URL must start with https://"
							: undefined,
				},
			},
		]);

		return [
			{
				name: "Discord connection",
				render: (setting) => this.renderConnection(setting),
			},
			{
				name: "Discord client ID",
				desc:
					"Your Discord application client ID. Leave empty to use the default. " +
					"Create your own app at discord.com/developers/applications for custom images and branding.",
				control: { type: "text", key: "clientId", placeholder: DEFAULT_CLIENT_ID },
			},
			{
				name: "Show vault name",
				desc: "Display your vault name in Discord status.",
				control: { type: "toggle", key: "showVaultName" },
			},
			{
				name: "Custom vault name",
				desc: "Override the vault name shown in Discord. Leave empty to use the real vault name.",
				visible: () => settings().showVaultName,
				control: {
					type: "text",
					key: "customVaultName",
					placeholder: this.app.vault.getName(),
				},
			},
			{
				name: "Show file name",
				desc: "Display the current file name in Discord status.",
				control: { type: "toggle", key: "showFileName" },
			},
			{
				name: "Show file extension",
				desc: "Include the file extension (e.g. .md) in the file name.",
				visible: () => settings().showFileName,
				control: { type: "toggle", key: "showFileExtension" },
			},
			{
				name: "Per-file timer",
				desc:
					"When on: timer resets each time you open a new file. " +
					"When off: timer shows total time since the plugin was loaded.",
				control: { type: "toggle", key: "usePerFileTimer" },
			},
			{
				name: "Show connection notices",
				desc: "Show a notice when the plugin connects to Discord.",
				control: { type: "toggle", key: "showConnectionNotices" },
			},
			{
				name: "Swap image layout",
				desc:
					"When on: editing/reading icon is the large image and the Obsidian logo is the small image. " +
					"When off (default): Obsidian logo is large, editing/reading icon is small.",
				control: { type: "toggle", key: "swapImages" },
			},
			{
				name: "No file open text",
				desc: 'Text shown in Discord when no file is active. Default: "No file open".',
				control: { type: "text", key: "noFileText", placeholder: "No file open" },
			},
			{
				type: "group",
				heading: "Custom status format",
				items: [
					{
						name: "Details format",
						desc: `Top line on the Discord status (e.g. "Editing {fileNoExt}"). Leave empty for the default. ${PLACEHOLDERS}`,
						control: {
							type: "text",
							key: "customDetailsFormat",
							placeholder: "Editing {fileNoExt}",
						},
					},
					{
						name: "State format",
						desc: `Bottom line on the Discord status (e.g. "{mode} in {vault}"). Leave empty for the default. ${PLACEHOLDERS}`,
						control: {
							type: "text",
							key: "customStateFormat",
							placeholder: "{mode} in {vault}",
						},
					},
				],
			},
			{
				type: "group",
				heading: "Exclusion list",
				items: [
					{
						name: "Excluded patterns",
						desc:
							"Files or folders matching any of these patterns will be hidden from Discord " +
							"(one pattern per line). Supports plain text (Privat/) and glob patterns (Journal/**, *.canvas).",
						control: {
							type: "textarea",
							key: "excludePatterns",
							placeholder: "Privat/\nJournal/\nsecret.md",
						},
					},
				],
			},
			{
				type: "group",
				heading: "Idle detection",
				items: [
					{
						name: "Enable idle detection",
						desc: "Automatically change or clear your presence after a period of inactivity.",
						control: { type: "toggle", key: "idleDetectionEnabled" },
					},
					{
						name: "Idle timeout (minutes)",
						desc: "How long to wait before marking you as idle.",
						visible: () => settings().idleDetectionEnabled,
						control: {
							type: "number",
							key: "idleTimeoutMinutes",
							placeholder: "10",
							min: 1,
							validate: (value) =>
								value >= 1 ? undefined : "Must be at least 1 minute",
						},
					},
					{
						name: "When idle",
						desc: "What to show on Discord when you are idle.",
						visible: () => settings().idleDetectionEnabled,
						control: {
							type: "dropdown",
							key: "idleAction",
							options: {
								afk: "Away from keyboard",
								clear: "Clear presence entirely",
							},
						},
					},
				],
			},
			{
				type: "group",
				heading: "Profile buttons",
				items: buttonRows,
			},
		];
	}

	getControlValue(key: string): unknown {
		const settings = this.plugin.settings;
		const button = /^button([01])(Label|Url)$/.exec(key);
		if (button) {
			const entry = settings.buttons[Number(button[1])];
			return button[2] === "Label" ? entry.label : entry.url;
		}
		if (key === "clientId") {
			return settings.clientId === DEFAULT_CLIENT_ID ? "" : settings.clientId;
		}
		return (settings as unknown as Record<string, unknown>)[key];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		const settings = this.plugin.settings;
		const button = /^button([01])(Label|Url)$/.exec(key);

		if (button) {
			const entry = settings.buttons[Number(button[1])];
			const text = asString(value);
			if (button[2] === "Label") {
				entry.label = text.slice(0, 32);
			} else {
				entry.url = text.trim();
			}
		} else if (key === "clientId") {
			settings.clientId = asString(value).trim() || DEFAULT_CLIENT_ID;
		} else if (key === "idleTimeoutMinutes") {
			const minutes = Math.floor(Number(value));
			if (!Number.isFinite(minutes) || minutes < 1) return;
			settings.idleTimeoutMinutes = minutes;
		} else {
			Object.assign(settings, { [key]: value });
		}

		await this.plugin.saveSettings();

		if (key === "clientId") this.plugin.reconnect();
		if (STRUCTURAL_KEYS.has(key)) this.refreshView();
		if (!SILENT_KEYS.has(key) && key !== "idleTimeoutMinutes") this.plugin.updateActivity();
	}

	/** Re-renders the tab after external state (connection, pause) changed. */
	refresh(): void {
		if (typeof this.update === "function") {
			this.update();
		} else {
			// eslint-disable-next-line @typescript-eslint/no-deprecated -- fallback for Obsidian < 1.13
			this.display();
		}
	}

	/**
	 * Imperative fallback for Obsidian < 1.13, which does not know about
	 * getSettingDefinitions(). Newer versions never call this.
	 */
	display(): void {
		this.containerEl.empty();
		this.renderItems(this.getSettingDefinitions());
	}

	private refreshView(): void {
		if (typeof this.refreshDomState === "function") {
			this.refreshDomState();
		} else {
			// eslint-disable-next-line @typescript-eslint/no-deprecated -- fallback for Obsidian < 1.13
			this.display();
		}
	}

	private renderConnection(setting: Setting): void {
		setting
			.setDesc(this.plugin.connected ? "🟢 Connected" : "🔴 Not connected")
			.addButton((btn) =>
				btn.setButtonText("Reconnect").onClick(() => {
					this.plugin.reconnect();
					btn.setDisabled(true);
					btn.setButtonText("Reconnecting…");
					window.setTimeout(() => this.refresh(), 5000);
				})
			)
			.addButton((btn) =>
				btn
					.setButtonText(this.plugin.settings.paused ? "Resume" : "Pause")
					.setCta()
					.onClick(() => this.plugin.setPaused(!this.plugin.settings.paused))
			);
	}

	private renderItems(items: SettingDefinitionItem[]): void {
		for (const item of items) {
			if ("type" in item) {
				if (item.type === "page") continue;
				if (!isShown(item.visible)) continue;
				if (item.heading) new Setting(this.containerEl).setName(item.heading).setHeading();
				this.renderItems(item.items ?? []);
			} else if (isShown(item.visible)) {
				this.renderDefinition(item);
			}
		}
	}

	private renderDefinition(def: SettingDefinition): void {
		const setting = new Setting(this.containerEl).setName(def.name);
		if (def.desc) setting.setDesc(def.desc);

		if (def.render) {
			def.render(setting, undefined as never);
			return;
		}

		const control = def.control;
		if (!control) return;

		const current = this.getControlValue(control.key);
		const commit = (value: unknown) => void this.commit(control, value);

		switch (control.type) {
			case "toggle":
				setting.addToggle((toggle) => toggle.setValue(current === true).onChange(commit));
				break;
			case "text":
				setting.addText((text) =>
					text
						.setPlaceholder(control.placeholder ?? "")
						.setValue(asString(current))
						.onChange(commit)
				);
				break;
			case "textarea":
				setting.addTextArea((area) =>
					area
						.setPlaceholder(control.placeholder ?? "")
						.setValue(asString(current))
						.onChange(commit)
				);
				break;
			case "number":
				setting.addText((text) =>
					text
						.setPlaceholder(control.placeholder ?? "")
						.setValue(asString(current))
						.onChange((value) => {
							const parsed = parseInt(value, 10);
							if (!isNaN(parsed)) commit(parsed);
						})
				);
				break;
			case "dropdown":
				setting.addDropdown((drop) => {
					for (const [value, label] of Object.entries(control.options)) {
						drop.addOption(value, label);
					}
					drop.setValue(asString(current)).onChange(commit);
				});
				break;
			default:
				break;
		}
	}

	private async commit(control: SettingControl, value: unknown): Promise<void> {
		const validate: Validator | undefined = control.validate;
		const error = validate ? await validate(value) : undefined;
		if (error) {
			new Notice(error);
			return;
		}
		await this.setControlValue(control.key, value);
	}
}
