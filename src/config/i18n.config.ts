export const supportedLocales = ["en", "ar"] as const;

export type Locale = (typeof supportedLocales)[number];

export type TextDirection = "ltr" | "rtl";

export const i18nConfig = {
  defaultLocale: "en" satisfies Locale,
  supportedLocales: [...supportedLocales],
  storageKey: "from10-locale",

  localeLabels: {
    en: "English",
    ar: "العربية",
  } as const satisfies Record<Locale, string>,

  localeDirection: {
    en: "ltr",
    ar: "rtl",
  } as const satisfies Record<Locale, TextDirection>,
} as const;

export type I18nConfig = typeof i18nConfig;
