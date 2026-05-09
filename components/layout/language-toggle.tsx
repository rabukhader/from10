"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Locale } from "@/src/config";
import { i18nConfig } from "@/src/config";

import { useLocale } from "@/components/providers/locale-provider";

import { cn } from "@/lib/utils";

export function LanguageToggle({
  label,
}: Readonly<{
  label: string;
}>) {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-2">
      <span className="sr-only">{label}</span>
      <Select
        value={locale}
        onValueChange={(value) => setLocale(value as Locale)}
      >
        <SelectTrigger
          size="sm"
          aria-label={label}
          className={cn(
            "min-h-11 max-w-[min(100%,11rem)] md:h-8 md:min-h-8 md:max-w-none",
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {i18nConfig.supportedLocales.map((code) => (
            <SelectItem key={code} value={code}>
              {i18nConfig.localeLabels[code]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
