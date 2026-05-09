import { storageKeys } from "./keys";
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
} from "./local-storage";

export function getOpenAiApiKey(): string | null {
  const raw = getLocalStorageItem(storageKeys.openAiApiKey);
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function setOpenAiApiKey(key: string): void {
  setLocalStorageItem(storageKeys.openAiApiKey, key.trim());
}

export function clearOpenAiApiKey(): void {
  removeLocalStorageItem(storageKeys.openAiApiKey);
}
