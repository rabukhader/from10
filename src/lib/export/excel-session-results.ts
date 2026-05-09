import * as XLSX from "xlsx";

import type { ExamQuestion, GradingSessionDocument } from "@/src/domain";

import { sortedExamQuestions } from "@/src/lib/results/grading-coverage";

export function sanitizeExcelFilenamePart(raw: string): string {
  const trimmed = raw.trim().replace(/[\\/:*?"<>|]/g, "_");
  return trimmed.slice(0, 80) || "session";
}

export type SimpleExportLabels = {
  sheetName: string;
  name: string;
  universityId: string;
  email: string;
  totalScore: string;
  overallFeedback: string;
  questionScoreHeader: (question: ExamQuestion) => string;
};

export type DetailedExportLabels = SimpleExportLabels & {
  questionNumber: string;
  questionTitle: string;
  questionTotalAwarded: string;
  questionMaxMarks: string;
  criterionTitle: string;
  criterionAwarded: string;
  criterionMaxMarks: string;
  criterionReasoning: string;
  questionFeedback: string;
  gradedAt: string;
};

export function buildSimpleResultsWorkbook(
  doc: GradingSessionDocument,
  labels: SimpleExportLabels,
): XLSX.WorkBook {
  const questions = sortedExamQuestions(doc.questions);
  const headerRow: string[] = [
    labels.name,
    labels.universityId,
    labels.email,
    labels.totalScore,
    ...questions.map((question) => labels.questionScoreHeader(question)),
    labels.overallFeedback,
  ];

  const rows: (string | number)[][] = [headerRow];

  for (const participant of doc.participants) {
    const grading = doc.gradingByParticipantId[participant.id];
    const row: (string | number)[] = [
      participant.name ?? "",
      participant.universityId ?? "",
      participant.email ?? "",
      grading?.totalScore ?? "",
      ...questions.map((question) => {
        const snap = grading?.questionGrades[question.id];
        return snap?.totalAwardedMark ?? "";
      }),
      grading?.overallFeedback ?? "",
    ];
    rows.push(row);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    labels.sheetName.slice(0, 31),
  );
  return workbook;
}

export function buildDetailedResultsWorkbook(
  doc: GradingSessionDocument,
  labels: DetailedExportLabels,
): XLSX.WorkBook {
  const questions = sortedExamQuestions(doc.questions);
  const headerRow = [
    labels.name,
    labels.universityId,
    labels.email,
    labels.questionNumber,
    labels.questionTitle,
    labels.questionTotalAwarded,
    labels.questionMaxMarks,
    labels.criterionTitle,
    labels.criterionAwarded,
    labels.criterionMaxMarks,
    labels.criterionReasoning,
    labels.questionFeedback,
    labels.overallFeedback,
    labels.gradedAt,
  ];

  const rows: (string | number)[][] = [headerRow];

  for (const participant of doc.participants) {
    const grading = doc.gradingByParticipantId[participant.id];
    const overallFeedback = grading?.overallFeedback ?? "";
    const name = participant.name ?? "";
    const universityId = participant.universityId ?? "";
    const email = participant.email ?? "";

    for (const question of questions) {
      const snapshot = grading?.questionGrades[question.id];
      if (!snapshot) continue;

      if (snapshot.criteria.length === 0) {
        rows.push([
          name,
          universityId,
          email,
          question.questionNumber,
          question.title,
          snapshot.totalAwardedMark,
          snapshot.maxMark,
          "—",
          "",
          "",
          "",
          snapshot.feedback,
          overallFeedback,
          snapshot.gradedAt,
        ]);
        continue;
      }

      for (const criterionSnapshot of snapshot.criteria) {
        const criterionMeta = question.criteria.find(
          (criterion) => criterion.id === criterionSnapshot.criterionId,
        );
        rows.push([
          name,
          universityId,
          email,
          question.questionNumber,
          question.title,
          snapshot.totalAwardedMark,
          snapshot.maxMark,
          criterionMeta?.title ?? criterionSnapshot.criterionId,
          criterionSnapshot.awardedMark,
          criterionSnapshot.maxMark,
          criterionSnapshot.reasoning ?? "",
          snapshot.feedback,
          overallFeedback,
          snapshot.gradedAt,
        ]);
      }
    }
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    labels.sheetName.slice(0, 31),
  );
  return workbook;
}

export function downloadExcelWorkbook(
  workbook: XLSX.WorkBook,
  filename: string,
): void {
  const safe =
    filename.endsWith(".xlsx") || filename.endsWith(".xls")
      ? filename
      : `${filename}.xlsx`;
  XLSX.writeFile(workbook, safe);
}
