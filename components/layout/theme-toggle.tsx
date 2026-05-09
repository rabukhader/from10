"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export function ThemeToggle({
  labels,
}: Readonly<{ labels: { light: string; dark: string } }>) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        aria-hidden
        disabled
        className="min-h-11 min-w-11 sm:min-h-10 sm:min-w-10"
      >
        <MoonIcon className="size-4 opacity-50" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={isDark ? labels.light : labels.dark}
      className={cn("min-h-11 min-w-11 sm:min-h-10 sm:min-w-10")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <SunIcon className="size-4" />
      ) : (
        <MoonIcon className="size-4" />
      )}
    </Button>
  );
}
