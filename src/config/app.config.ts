/**
 * Application identity and UI tuning — edit here instead of scattering strings across components.
 */
export const appConfig = {
  name: "from10",
  shortName: "from10",
  /** One-line product summary (metadata, hero, etc.). */
  tagline:
    "Browser-only instructor grading: sessions, preferences, AI-assisted marking, Excel export.",
  /** Longer description for onboarding and SEO. */
  description:
    "from10 helps teachers create exam grading setups, set preferences, grade participants one by one with AI assistance, and export results — local-first, no backend.",

  branding: {
    /** Alt text for logo region when an image is added later. */
    logoAlt: "from10",
    /** Short trust line under title where useful. */
    subtitle: "Local-first grading for instructors",
  },

  /** Defaults for dashboard lists, uploads, and similar — not business rules for grading. */
  ui: {
    dashboardRecentSessionsLimit: 5,
    maxFilesPerSubmission: 12,
    maxPasteCharacters: 500_000,
    /** Max characters appended per extracted attachment into grading prompts. */
    maxAttachmentTextCharacters: 60_000,
    /** Debounce or UX delays (ms); wire in features as needed. */
    autosaveDebounceMs: 400,
    /** Max rasterized pages/images sent with each AI grading request (vision). */
    maxGradingVisionSlots: 14,
    /** Max PDF pages rasterized per attachment during grading (within vision slots). */
    maxGradingPdfPagesPerFile: 8,
  },

  /** OpenAI Chat Completions (browser-side grading); model IDs depend on account/API availability. */
  openAi: {
    gradingModel: "gpt-4o",
    /** Vision-capable model for extracting structured questions from exam images. */
    examExtractionModel: "gpt-4o",
    /** Attempts after the first failed validation (total tries = 1 + maxJsonRetries). */
    maxJsonRetries: 2,
    chatCompletionsUrl: "https://api.openai.com/v1/chat/completions",
    /** Max images plus rasterized PDF pages sent to the vision model in one extraction. */
    maxExamVisionSlots: 18,
    /** Cap PDF rendering so one huge document cannot spam the API. */
    maxPdfPagesPerFile: 12,
    maxExamUploadBytesPerFile: 15 * 1024 * 1024,
  },

  /**
   * Must stay aligned with the installed `pdfjs-dist` version so CDN URLs for the worker,
   * standard fonts, and CMaps load correctly when rasterizing PDFs in the browser.
   */
  pdfJs: {
    distVersion: "4.10.38",
  },
} as const;

export type AppConfig = typeof appConfig;
