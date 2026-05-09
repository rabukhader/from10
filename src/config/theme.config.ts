/**
 * Theme identity and palette tokens (blue + white educational; dark = cool navy/slate).
 * CSS variables in `app/globals.css` should stay aligned with these values when you change the palette.
 */
export const themeConfig = {
  name: "from10-educational-blue",
  defaultMode: "light" as const,
  storageKey: "from10-theme",

  /**
   * Semantic tokens as OKLCH strings for `:root` / `.dark` (--background, --primary, …).
   */
  tokens: {
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.21 0.03 260)",
      card: "oklch(1 0 0)",
      cardForeground: "oklch(0.21 0.03 260)",
      popover: "oklch(1 0 0)",
      popoverForeground: "oklch(0.21 0.03 260)",
      primary: "oklch(0.52 0.18 252)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.96 0.02 252)",
      secondaryForeground: "oklch(0.28 0.05 260)",
      muted: "oklch(0.967 0.008 252)",
      mutedForeground: "oklch(0.48 0.04 260)",
      accent: "oklch(0.94 0.03 252)",
      accentForeground: "oklch(0.28 0.05 260)",
      destructive: "oklch(0.577 0.245 27.325)",
      border: "oklch(0.92 0.02 252)",
      input: "oklch(0.92 0.02 252)",
      ring: "oklch(0.52 0.18 252)",
      radiusRem: 0.625,
      sidebar: "oklch(0.985 0.008 252)",
      sidebarForeground: "oklch(0.21 0.03 260)",
      sidebarPrimary: "oklch(0.52 0.18 252)",
      sidebarPrimaryForeground: "oklch(0.99 0 0)",
      sidebarAccent: "oklch(0.96 0.02 252)",
      sidebarAccentForeground: "oklch(0.28 0.05 260)",
      sidebarBorder: "oklch(0.92 0.02 252)",
      sidebarRing: "oklch(0.52 0.18 252)",
    },
    dark: {
      background: "oklch(0.17 0.04 260)",
      foreground: "oklch(0.97 0.01 252)",
      card: "oklch(0.22 0.04 260)",
      cardForeground: "oklch(0.97 0.01 252)",
      popover: "oklch(0.22 0.04 260)",
      popoverForeground: "oklch(0.97 0.01 252)",
      primary: "oklch(0.62 0.17 252)",
      primaryForeground: "oklch(0.15 0.04 260)",
      secondary: "oklch(0.28 0.04 260)",
      secondaryForeground: "oklch(0.97 0.01 252)",
      muted: "oklch(0.28 0.04 260)",
      mutedForeground: "oklch(0.72 0.03 252)",
      accent: "oklch(0.30 0.045 260)",
      accentForeground: "oklch(0.97 0.01 252)",
      destructive: "oklch(0.704 0.191 22.216)",
      border: "oklch(1 0 0 / 12%)",
      input: "oklch(1 0 0 / 14%)",
      ring: "oklch(0.62 0.17 252)",
      radiusRem: 0.625,
      sidebar: "oklch(0.20 0.045 260)",
      sidebarForeground: "oklch(0.97 0.01 252)",
      sidebarPrimary: "oklch(0.62 0.17 252)",
      sidebarPrimaryForeground: "oklch(0.97 0.01 252)",
      sidebarAccent: "oklch(0.28 0.04 260)",
      sidebarAccentForeground: "oklch(0.97 0.01 252)",
      sidebarBorder: "oklch(1 0 0 / 12%)",
      sidebarRing: "oklch(0.62 0.17 252)",
    },
  },
} as const;

export type ThemeConfig = typeof themeConfig;
