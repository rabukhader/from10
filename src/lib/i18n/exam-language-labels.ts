import type { ExamPrimaryLanguage } from "@/src/domain";

import type { MessageKey } from "./messages";

export type Translate = (key: MessageKey) => string;

export function labelExamPrimaryLanguage(
  t: Translate,
  value: ExamPrimaryLanguage,
): string {
  const map: Record<ExamPrimaryLanguage, MessageKey> = {
    auto: "session.examLanguage.auto",
    en: "session.examLanguage.en",
    ar: "session.examLanguage.ar",
    fr: "session.examLanguage.fr",
    mixed: "session.examLanguage.mixed",
  };
  return t(map[value]);
}
