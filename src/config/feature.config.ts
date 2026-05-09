/**
 * Feature flags — toggle behavior without touching feature modules.
 */
export const featureConfig = {
  /** OpenAI-assisted grading (requires API key onboarding). */
  aiGrading: true,
  /** Excel export (simple + detailed modes). */
  excelExport: true,
  /** IndexedDB for submission blobs (MVP). */
  indexedDbSubmissions: true,
  /** Show beta / experimental UI sections when added later. */
  experimentalUi: false,
} as const;

export type FeatureConfig = typeof featureConfig;
