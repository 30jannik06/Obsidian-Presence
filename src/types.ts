export const DEFAULT_CLIENT_ID = "1493243390911844574";

export interface PresenceSettings {
  clientId: string;
  showVaultName: boolean;
  showFileName: boolean;
  showFileExtension: boolean;
  usePerFileTimer: boolean;
  customVaultName: string;
  showConnectionNotices: boolean;
}

export const DEFAULT_SETTINGS: PresenceSettings = {
  clientId: DEFAULT_CLIENT_ID,
  showVaultName: true,
  showFileName: true,
  showFileExtension: true,
  usePerFileTimer: false,
  customVaultName: "",
  showConnectionNotices: true,
};
