"use client";

import * as React from "react";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { MobileSidebarSheet } from "./mobile-sidebar-sheet";
import { SkipNavLink } from "./skip-nav-link";

export function AppShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">
      <SkipNavLink />
      <AppHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
      <MobileSidebarSheet
        open={mobileSidebarOpen}
        onOpenChange={setMobileSidebarOpen}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-row pt-14">
        <AppSidebar />
        <div
          id="main-scroll-region"
          className="relative min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] scroll-smooth touch-pan-y"
        >
          <main
            id="main-content"
            tabIndex={-1}
            className="min-w-0 px-4 py-6 sm:px-5 sm:py-7 lg:px-8 lg:py-10"
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
