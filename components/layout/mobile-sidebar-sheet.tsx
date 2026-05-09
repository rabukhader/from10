"use client";

import { i18nConfig } from "@/src/config";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useLocale } from "@/components/providers/locale-provider";

import { SidebarNav } from "./sidebar-nav";

export function MobileSidebarSheet({
  open,
  onOpenChange,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>) {
  const { t, locale } = useLocale();
  const side =
    i18nConfig.localeDirection[locale] === "rtl" ? "right" : "left";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        showCloseButton
        className="flex w-[min(100%-1rem,20rem)] max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-sm"
      >
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle>{t("nav.menu")}</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <SidebarNav
            density="drawer"
            onNavigate={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
