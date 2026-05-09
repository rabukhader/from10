"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { useLocale } from "@/components/providers/locale-provider";
import { useApiKey } from "@/components/providers/api-key-provider";

import { AppShell } from "./app-shell";

export function AppChrome({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, hasApiKey } = useApiKey();
  const { t } = useLocale();

  React.useEffect(() => {
    if (!ready) return;

    const onOnboarding = pathname === "/onboarding";

    if (!hasApiKey && !onOnboarding) {
      router.replace("/onboarding");
      return;
    }

    if (hasApiKey && onOnboarding) {
      router.replace("/");
    }
  }, [ready, hasApiKey, pathname, router]);

  if (!ready) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-background px-4 py-12"
      >
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  const onOnboarding = pathname === "/onboarding";

  if (!hasApiKey) {
    if (onOnboarding) {
      return (
        <div className="flex min-h-dvh min-h-full flex-1 flex-col overflow-x-hidden">
          {children}
        </div>
      );
    }
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-background px-4"
      >
        <span className="sr-only">{t("common.redirecting")}</span>
        <p className="text-sm text-muted-foreground">{t("common.redirecting")}</p>
      </div>
    );
  }

  if (onOnboarding) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-background px-4"
      >
        <span className="sr-only">{t("common.redirecting")}</span>
        <p className="text-sm text-muted-foreground">{t("common.redirecting")}</p>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
