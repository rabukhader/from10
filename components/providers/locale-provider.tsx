"use client";

import * as React from "react";

import type { Locale } from "@/src/config";
import { i18nConfig } from "@/src/config";
import type { MessageKey } from "@/src/lib/i18n/messages";
import { messages } from "@/src/lib/i18n/messages";
import { hasLocalStorage, setLocalStorageItem } from "@/src/lib/storage";

function parseStoredLocale(raw: string | null): Locale {
  if (
    raw &&
    (i18nConfig.supportedLocales as readonly string[]).includes(raw)
  ) {
    return raw as Locale;
  }
  return i18nConfig.defaultLocale;
}

function readLocaleFromStorage(): Locale {
  if (!hasLocalStorage()) return i18nConfig.defaultLocale;
  try {
    return parseStoredLocale(window.localStorage.getItem(i18nConfig.storageKey));
  } catch {
    return i18nConfig.defaultLocale;
  }
}

function persistLocale(locale: Locale): void {
  if (!hasLocalStorage()) return;
  try {
    setLocalStorageItem(i18nConfig.storageKey, locale);
  } catch {
    /* quota / privacy mode */
  }
}

function applyDocumentLocale(locale: Locale): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale === "ar" ? "ar" : "en";
  document.documentElement.dir = i18nConfig.localeDirection[locale];
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
};

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [locale, setLocaleState] = React.useState<Locale>(
    i18nConfig.defaultLocale,
  );

  React.useEffect(() => {
    const initial = readLocaleFromStorage();
    setLocaleState(initial);
    applyDocumentLocale(initial);
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    persistLocale(next);
    applyDocumentLocale(next);
  }, []);

  const t = React.useCallback(
    (key: MessageKey) => messages[locale][key] ?? messages.en[key] ?? key,
    [locale],
  );

  const value = React.useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider.");
  }
  return ctx;
}
