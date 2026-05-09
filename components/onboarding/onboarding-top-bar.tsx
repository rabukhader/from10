"use client";

import { appConfig } from "@/src/config";

import { useLocale } from "@/components/providers/locale-provider";

import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function OnboardingTopBar() {
  const { t } = useLocale();

  return (
    <div
      dir="ltr"
      className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-card/90 px-4 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-card/80 sm:px-6"
    >
      <span className="truncate font-heading text-base font-semibold tracking-tight sm:text-lg">
        {appConfig.name}
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle
          labels={{
            light: t("theme.toggleLight"),
            dark: t("theme.toggleDark"),
          }}
        />
        <LanguageToggle label={t("language.label")} />
      </div>
    </div>
  );
}
