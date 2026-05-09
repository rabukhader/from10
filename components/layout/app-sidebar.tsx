"use client";

import { SidebarNav } from "./sidebar-nav";

export function AppSidebar() {
  return (
    <aside className="hidden w-56 min-w-0 shrink-0 border-e bg-sidebar lg:flex lg:flex-col">
      <SidebarNav density="rail" className="p-3" />
    </aside>
  );
}
