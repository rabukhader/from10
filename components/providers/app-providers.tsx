"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";

import { AppChrome } from "@/components/layout/app-chrome";
import { themeConfig } from "@/src/config";

import { ApiKeyProvider } from "./api-key-provider";
import { LocaleProvider } from "./locale-provider";

export function AppProviders({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={themeConfig.defaultMode}
      enableSystem
      storageKey={themeConfig.storageKey}
      disableTransitionOnChange
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <LocaleProvider>
          <ApiKeyProvider>
            <AppChrome>{children}</AppChrome>
          </ApiKeyProvider>
        </LocaleProvider>
      </div>
    </ThemeProvider>
  );
}
