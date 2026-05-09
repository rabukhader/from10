"use client";

import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { appConfig } from "@/src/config";

import { Button } from "@/components/ui/button";

import { useLocale } from "@/components/providers/locale-provider";

import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";

export function AppHeader({
  onOpenMobileSidebar,
}: Readonly<{
  onOpenMobileSidebar?: () => void;
}>) {
  const { t } = useLocale();

  return (
    <header
      dir="ltr"
      className="fixed inset-x-0 top-0 z-50 shrink-0 border-b bg-card/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-card/85"
    >
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {onOpenMobileSidebar ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t("nav.openMenu")}
              className="shrink-0 lg:hidden min-h-11 min-w-11 sm:min-h-10 sm:min-w-10"
              onClick={onOpenMobileSidebar}
            >
              <MenuIcon className="size-5 sm:size-4" aria-hidden />
            </Button>
          ) : null}
          <Link
            href="/"
            className="min-w-0 truncate font-heading text-base font-semibold tracking-tight text-foreground hover:text-primary sm:text-lg"
          >
            {appConfig.name}
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <ThemeToggle
            labels={{
              light: t("theme.toggleLight"),
              dark: t("theme.toggleDark"),
            }}
          />
          <LanguageToggle label={t("language.label")} />
        </div>
      </div>
    </header>
  );
}
