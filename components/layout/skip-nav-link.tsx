"use client";

import { useLocale } from "@/components/providers/locale-provider";

/** Keyboard-first skip link — pairs with `#main-content` on `<main>`. */
export function SkipNavLink() {
  const { t } = useLocale();
  return (
    <a href="#main-content" className="skip-link">
      {t("nav.skipToContent")}
    </a>
  );
}
