"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboardIcon, SettingsIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { useLocale } from "@/components/providers/locale-provider";

const railLinkClass = cn(
  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
  "text-muted-foreground hover:bg-muted hover:text-foreground",
  "aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary",
);

const drawerLinkClass = cn(
  railLinkClass,
  "min-h-11 py-3 sm:min-h-10 sm:py-2.5",
);

export type SidebarNavDensity = "rail" | "drawer";

export function SidebarNav({
  onNavigate,
  density = "rail",
  className,
}: Readonly<{
  onNavigate?: () => void;
  density?: SidebarNavDensity;
  className?: string;
}>) {
  const pathname = usePathname();
  const { t } = useLocale();

  const linkClass = density === "drawer" ? drawerLinkClass : railLinkClass;

  function activate(): void {
    onNavigate?.();
  }

  return (
    <nav
      className={cn("flex flex-col gap-1", className)}
      aria-label={t("nav.primary")}
    >
      <Link
        href="/"
        className={linkClass}
        aria-current={pathname === "/" ? "page" : undefined}
        onClick={activate}
      >
        <LayoutDashboardIcon className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{t("nav.dashboard")}</span>
      </Link>
      <Link
        href="/settings"
        className={linkClass}
        aria-current={pathname.startsWith("/settings") ? "page" : undefined}
        onClick={activate}
      >
        <SettingsIcon className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{t("nav.settings")}</span>
      </Link>
    </nav>
  );
}
