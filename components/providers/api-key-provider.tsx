"use client";

import * as React from "react";

import { getOpenAiApiKey } from "@/src/lib/storage/openai-key";
import { storageKeys } from "@/src/lib/storage/keys";

type ApiKeyContextValue = {
  ready: boolean;
  hasApiKey: boolean;
  refreshApiKey: () => void;
};

const ApiKeyContext = React.createContext<ApiKeyContextValue | null>(null);

export function ApiKeyProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [ready, setReady] = React.useState(false);
  const [hasApiKey, setHasApiKey] = React.useState(false);

  const refreshApiKey = React.useCallback(() => {
    setHasApiKey(Boolean(getOpenAiApiKey()));
  }, []);

  React.useEffect(() => {
    refreshApiKey();
    setReady(true);
  }, [refreshApiKey]);

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (
        event.key === storageKeys.openAiApiKey ||
        event.key === null
      ) {
        refreshApiKey();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshApiKey]);

  const value = React.useMemo(
    () => ({ ready, hasApiKey, refreshApiKey }),
    [ready, hasApiKey, refreshApiKey],
  );

  return (
    <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>
  );
}

export function useApiKey(): ApiKeyContextValue {
  const ctx = React.useContext(ApiKeyContext);
  if (!ctx) {
    throw new Error("useApiKey must be used within ApiKeyProvider.");
  }
  return ctx;
}
