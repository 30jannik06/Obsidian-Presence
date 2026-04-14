export const DEFAULT_CLIENT_ID = "1493243390911844574";

export interface PresenceButton {
  label: string;
  url: string;
}

export interface PresenceSettings {
  clientId: string;
  showVaultName: boolean;
  showFileName: boolean;
  showFileExtension: boolean;
  usePerFileTimer: boolean;
  customVaultName: string;
  showConnectionNotices: boolean;
  buttons: [PresenceButton, PresenceButton];
  paused: boolean;
  idleDetectionEnabled: boolean;
  idleTimeoutMinutes: number;
  idleAction: "afk" | "clear";
  excludePatterns: string;
  customDetailsFormat: string;
  customStateFormat: string;
}

export const DEFAULT_SETTINGS: PresenceSettings = {
  clientId: DEFAULT_CLIENT_ID,
  showVaultName: true,
  showFileName: true,
  showFileExtension: true,
  usePerFileTimer: false,
  customVaultName: "",
  showConnectionNotices: true,
  buttons: [
    { label: "", url: "" },
    { label: "", url: "" },
  ],
  paused: false,
  idleDetectionEnabled: false,
  idleTimeoutMinutes: 10,
  idleAction: "afk",
  excludePatterns: "",
  customDetailsFormat: "",
  customStateFormat: "",
};
