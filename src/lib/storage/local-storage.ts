export function hasLocalStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

export function getLocalStorageItem(key: string): string | null {
  if (!hasLocalStorage()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setLocalStorageItem(key: string, value: string): void {
  if (!hasLocalStorage()) {
    throw new Error("localStorage is not available in this environment.");
  }
  window.localStorage.setItem(key, value);
}

export function removeLocalStorageItem(key: string): void {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function readJson<T>(key: string): T | null {
  const raw = getLocalStorageItem(key);
  if (raw === null || raw === "") return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  setLocalStorageItem(key, JSON.stringify(value));
}
