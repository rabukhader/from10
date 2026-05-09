"use client";

import { OpenAiApiKeySettings } from "@/components/settings/openai-api-key-settings";

import { useLocale } from "@/components/providers/locale-provider";

export default function SettingsPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("settings.pageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("settings.otherComing")}
        </p>
      </div>
      <OpenAiApiKeySettings />
    </div>
  );
}
