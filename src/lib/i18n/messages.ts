import type { Locale } from "@/src/config";

export type MessageKey =
  | "nav.primary"
  | "nav.menu"
  | "nav.openMenu"
  | "nav.skipToContent"
  | "nav.dashboard"
  | "nav.settings"
  | "nav.sessions"
  | "dashboard.title"
  | "dashboard.subtitle"
  | "dashboard.metric.sessions"
  | "dashboard.metric.graded"
  | "dashboard.metric.hint"
  | "dashboard.metric.sessionsDetail"
  | "dashboard.metric.gradedDetail"
  | "dashboard.quick.newSession"
  | "dashboard.quick.continue"
  | "dashboard.quick.continueNone"
  | "dashboard.recent.title"
  | "dashboard.recent.empty"
  | "dashboard.recent.untitled"
  | "dashboard.recent.deleteAria"
  | "dashboard.recent.deleteTitle"
  | "dashboard.recent.deleteDescription"
  | "dashboard.recent.deleteConfirm"
  | "dashboard.recent.deleteCancel"
  | "theme.toggleLight"
  | "theme.toggleDark"
  | "language.label"
  | "placeholder.newSession"
  | "placeholder.sessionWorkspace"
  | "common.loading"
  | "common.redirecting"
  | "apiKey.warning.title"
  | "apiKey.warning.browser"
  | "apiKey.error.empty"
  | "apiKey.error.format"
  | "apiKey.error.auth"
  | "apiKey.error.http"
  | "apiKey.error.network"
  | "apiKey.error.generic"
  | "apiKey.success.test"
  | "onboarding.title"
  | "onboarding.description"
  | "onboarding.fieldLabel"
  | "onboarding.fieldPlaceholder"
  | "onboarding.test"
  | "onboarding.continue"
  | "settings.pageTitle"
  | "settings.api.title"
  | "settings.api.hint"
  | "settings.api.stored"
  | "settings.api.noneStored"
  | "settings.api.newPlaceholder"
  | "settings.api.save"
  | "settings.api.remove"
  | "settings.api.retest"
  | "settings.api.removeTitle"
  | "settings.api.removeDescription"
  | "settings.api.removeConfirm"
  | "settings.api.removeCancel"
  | "prefs.exam.easy"
  | "prefs.exam.hard"
  | "prefs.exam.medium"
  | "prefs.feedback.balanced"
  | "prefs.feedback.detailed"
  | "prefs.feedback.short"
  | "prefs.strictness.balanced"
  | "prefs.strictness.easy"
  | "prefs.strictness.strict"
  | "prefs.student.advanced"
  | "prefs.student.beginner"
  | "prefs.student.intermediate"
  | "session.cancel"
  | "session.error.save"
  | "session.field.courseName"
  | "session.field.examDate"
  | "session.field.examTitle"
  | "session.field.primaryLanguage"
  | "session.field.primaryLanguageHint"
  | "session.field.notes"
  | "session.field.totalMarks"
  | "session.examLanguage.auto"
  | "session.examLanguage.en"
  | "session.examLanguage.ar"
  | "session.examLanguage.fr"
  | "session.examLanguage.mixed"
  | "session.new.subtitle"
  | "session.new.title"
  | "session.prefs.examLevel"
  | "session.prefs.feedbackStyle"
  | "session.prefs.strictness"
  | "session.prefs.studentLevel"
  | "session.section.exam"
  | "session.section.examHint"
  | "session.section.prefs"
  | "session.section.prefsHint"
  | "session.submit"
  | "session.submitting"
  | "session.validation.marks"
  | "session.validation.required"
  | "session.validation.title"
  | "session.workspace.backDashboard"
  | "session.workspace.course"
  | "session.workspace.examDate"
  | "session.workspace.invalid"
  | "session.workspace.notFoundBody"
  | "session.workspace.notFoundTitle"
  | "session.workspace.summaryHint"
  | "session.workspace.summaryTitle"
  | "session.workspace.editSession"
  | "session.workspace.editSessionHint"
  | "session.workspace.saveChanges"
  | "session.workspace.totalMarks"
  | "session.workspace.updated"
  | "questions.sectionTitle"
  | "questions.sectionHint"
  | "questions.add"
  | "questions.empty"
  | "questions.moveUp"
  | "questions.moveDown"
  | "questions.remove"
  | "questions.removeTitle"
  | "questions.removeDescription"
  | "questions.removeConfirm"
  | "questions.removeCancel"
  | "questions.colType"
  | "questions.colMarks"
  | "questions.edit"
  | "session.field.examTitleSuggestions"
  | "session.examTitleSuggestion.first"
  | "session.examTitleSuggestion.second"
  | "session.examTitleSuggestion.final"
  | "session.examTitleSuggestion.midterm"
  | "questions.upload.sectionTitle"
  | "questions.upload.sectionHint"
  | "questions.upload.pickFiles"
  | "questions.upload.fileTypesHint"
  | "questions.upload.extract"
  | "questions.upload.extracting"
  | "questions.upload.success"
  | "questions.upload.error.generic"
  | "questions.upload.error.noImages"
  | "questions.upload.error.tooMany"
  | "questions.upload.error.fileTooLarge"
  | "questions.upload.error.tooManySlots"
  | "questions.upload.replaceTitle"
  | "questions.upload.replaceDescription"
  | "questions.upload.replaceConfirm"
  | "questions.upload.replaceCancel"
  | "question.editor.title"
  | "question.editor.subtitle"
  | "question.editor.cancel"
  | "question.editor.save"
  | "question.field.questionNumber"
  | "question.field.title"
  | "question.field.body"
  | "question.field.type"
  | "question.field.totalMarks"
  | "question.field.notes"
  | "question.field.modelAnswer"
  | "question.type.multiple_choice"
  | "question.type.short_answer"
  | "question.type.long_answer"
  | "question.type.code"
  | "question.type.mixed"
  | "question.type.file_based"
  | "criteria.sectionTitle"
  | "criteria.sectionHint"
  | "criteria.rowLabel"
  | "criteria.remove"
  | "criteria.add"
  | "criteria.field.title"
  | "criteria.field.description"
  | "criteria.field.mark"
  | "question.validation.titleRequired"
  | "question.validation.totalMarkInteger"
  | "question.validation.criteriaRequired"
  | "question.validation.criterionTitle"
  | "question.validation.criterionMarkInvalid"
  | "question.validation.criteriaSum"
  | "session.workspace.footerHint"
  | "participants.sectionTitle"
  | "participants.sectionHint"
  | "participants.add"
  | "participants.empty"
  | "participants.open"
  | "participants.colStatus"
  | "participant.display.unlabeled"
  | "participant.dialog.title"
  | "participant.dialog.description"
  | "participant.dialog.submit"
  | "participant.dialog.cancel"
  | "participant.field.name"
  | "participant.field.universityId"
  | "participant.field.email"
  | "participant.field.section"
  | "participant.field.notes"
  | "participant.validation.identityRequired"
  | "participant.status.pending"
  | "participant.status.in_progress"
  | "participant.status.completed"
  | "participant.workspace.backSession"
  | "participant.workspace.notFoundTitle"
  | "participant.workspace.notFoundBody"
  | "participant.workspace.statusLabel"
  | "participant.workspace.identityTitle"
  | "participant.workspace.identityHint"
  | "submissions.cardTitle"
  | "submissions.cardHint"
  | "submissions.sectionTitle"
  | "submissions.sectionHint"
  | "submissions.field.pastedText"
  | "submissions.field.upload"
  | "submissions.uploadHint"
  | "submissions.uploadHintCombined"
  | "submissions.layoutModeLabel"
  | "submissions.layoutCombined"
  | "submissions.layoutPerQuestion"
  | "submissions.layoutPerQuestionDisabledHint"
  | "submissions.layoutCombinedHint"
  | "submissions.layoutPerQuestionHint"
  | "submissions.perQuestionNoExamQuestions"
  | "submissions.perQuestionIntro"
  | "submissions.answerAsText"
  | "submissions.answerAsAttachment"
  | "submissions.perQuestionTextLabel"
  | "submissions.perQuestionTextPlaceholder"
  | "submissions.afterAnswerGradeHint"
  | "submissions.perQuestionAttachmentHint"
  | "submissions.pastePlaceholder"
  | "submissions.chooseFiles"
  | "submissions.pendingUpload"
  | "submissions.save"
  | "submissions.saving"
  | "submissions.filesTitle"
  | "submissions.removeFile"
  | "submissions.downloadFile"
  | "submissions.emptyFiles"
  | "submissions.error.noIndexedDb"
  | "submissions.error.saveFailed"
  | "grading.sectionTitle"
  | "grading.sectionHint"
  | "grading.noQuestions"
  | "grading.loadingSubmission"
  | "grading.noApiKey"
  | "grading.openSettings"
  | "grading.weakSubmissionHint"
  | "grading.attemptsLabel"
  | "grading.totalScoreLabel"
  | "grading.noCriteria"
  | "grading.gradingBusy"
  | "grading.gradeWithAi"
  | "grading.gradeAllWithAi"
  | "grading.gradeAllBusy"
  | "grading.gradeManually"
  | "grading.questionScoreSuffix"
  | "grading.criterionMark"
  | "grading.criterionReasoning"
  | "grading.questionFeedback"
  | "grading.overallFeedback"
  | "grading.overallFeedbackHint"
  | "grading.saveProgress"
  | "grading.source.ai"
  | "grading.source.manual"
  | "grading.source.mixed"
  | "participants.results"
  | "participants.remove"
  | "participants.removeTitle"
  | "participants.removeDescription"
  | "participants.removeConfirm"
  | "participants.removeCancel"
  | "participant.results.shortcut"
  | "participant.results.title"
  | "participant.results.subtitle"
  | "participant.results.backParticipant"
  | "participant.results.identityHint"
  | "participant.results.scoreSummaryTitle"
  | "participant.results.scoreSummaryHint"
  | "participant.results.noGrading"
  | "participant.results.overallFeedbackTitle"
  | "participant.results.perQuestionTitle"
  | "participant.results.marksForQuestion"
  | "participant.results.notGradedYet"
  | "participant.results.criterionCol"
  | "participant.results.markCol"
  | "participant.results.questionFeedbackTitle"
  | "results.session.title"
  | "results.session.hint"
  | "results.session.coverageTitle"
  | "results.session.coverageHint"
  | "results.session.noParticipants"
  | "results.session.colParticipant"
  | "results.session.colProgress"
  | "results.session.colTotal"
  | "results.session.colActions"
  | "results.session.breakdown"
  | "results.session.workspace"
  | "results.session.exportSimple"
  | "results.session.exportDetailed"
  | "results.export.simpleSheet"
  | "results.export.detailedSheet"
  | "results.export.colName"
  | "results.export.colUniversityId"
  | "results.export.colEmail"
  | "results.export.colTotalScore"
  | "results.export.colOverallFeedback"
  | "results.export.questionScoreShort"
  | "results.export.colQuestionNumber"
  | "results.export.colQuestionTitle"
  | "results.export.colQuestionAwarded"
  | "results.export.colQuestionMax"
  | "results.export.colCriterionTitle"
  | "results.export.colCriterionAwarded"
  | "results.export.colCriterionMax"
  | "results.export.colCriterionReasoning"
  | "results.export.colQuestionFeedback"
  | "results.export.colGradedAt"
  | "settings.otherComing";

export const messages: Record<Locale, Record<MessageKey, string>> = {
  en: {
    "nav.primary": "Main navigation",
    "nav.menu": "Menu",
    "nav.openMenu": "Open navigation menu",
    "nav.skipToContent": "Skip to main content",
    "nav.dashboard": "Dashboard",
    "nav.settings": "Settings",
    "nav.sessions": "Sessions",
    "dashboard.title": "Dashboard",
    "dashboard.subtitle":
      "Create grading sessions, capture submissions, and export results — all in your browser.",
    "dashboard.metric.sessions": "Grading sessions",
    "dashboard.metric.graded": "Participants graded",
    "dashboard.metric.hint": "Stored locally in your browser.",
    "dashboard.metric.sessionsDetail":
      "How many grading sessions are saved in this browser.",
    "dashboard.metric.gradedDetail":
      "Counts participants marked as graded (completed) across all sessions.",
    "prefs.strictness.easy": "Easy",
    "prefs.strictness.balanced": "Balanced",
    "prefs.strictness.strict": "Strict",
    "prefs.student.beginner": "Beginner",
    "prefs.student.intermediate": "Intermediate",
    "prefs.student.advanced": "Advanced",
    "prefs.exam.easy": "Easy",
    "prefs.exam.medium": "Medium",
    "prefs.exam.hard": "Hard",
    "prefs.feedback.short": "Short",
    "prefs.feedback.balanced": "Balanced",
    "prefs.feedback.detailed": "Detailed",
    "session.new.title": "Create grading session",
    "session.new.subtitle":
      "Add exam details and instructor preferences. Questions and participants come next.",
    "session.section.exam": "Exam setup",
    "session.section.examHint":
      "Required fields are saved locally as part of this session.",
    "session.section.prefs": "Instructor preferences",
    "session.section.prefsHint":
      "These settings are included in AI grading prompts for this session.",
    "session.field.examTitle": "Exam title",
    "session.field.courseName": "Course name",
    "session.field.examDate": "Exam date",
    "session.field.totalMarks": "Total marks",
    "session.field.primaryLanguage": "Exam language",
    "session.field.primaryLanguageHint":
      "Used for AI grading and scan import: feedback language and how strictly to expect one language on papers.",
    "session.examLanguage.auto": "Auto — match the learner’s answer",
    "session.examLanguage.en": "English",
    "session.examLanguage.ar": "Arabic",
    "session.examLanguage.fr": "French",
    "session.examLanguage.mixed": "Mixed / bilingual on paper",
    "session.field.notes": "Notes (optional)",
    "session.prefs.strictness": "Grading strictness",
    "session.prefs.studentLevel": "Student level",
    "session.prefs.examLevel": "Exam difficulty",
    "session.prefs.feedbackStyle": "Feedback style",
    "session.submit": "Create session",
    "session.submitting": "Creating session…",
    "session.cancel": "Back to dashboard",
    "session.error.save":
      "Could not save this session. Check browser storage permissions or available space.",
    "session.validation.title": "Check your inputs",
    "session.validation.required":
      "Please fill exam title, course name, exam date, and valid total marks.",
    "session.validation.marks":
      "Total marks must be a positive whole number.",
    "session.workspace.invalid": "This session link looks invalid.",
    "session.workspace.backDashboard": "Back to dashboard",
    "session.workspace.notFoundTitle": "Session not found",
    "session.workspace.notFoundBody":
      "It may have been deleted from browser storage or the link is outdated.",
    "session.workspace.summaryTitle": "Session overview",
    "session.workspace.summaryHint":
      "What will be used later for AI-assisted grading and exports.",
    "session.workspace.editSession": "Edit session details",
    "session.workspace.editSessionHint":
      "Update the exam title, course, date, total marks, exam language, notes, and grading preferences for this session only.",
    "session.workspace.saveChanges": "Save changes",
    "session.workspace.course": "Course",
    "session.workspace.examDate": "Exam date",
    "session.workspace.totalMarks": "Total marks",
    "session.workspace.updated": "Last updated",
    "questions.sectionTitle": "Questions",
    "questions.sectionHint":
      "Add, reorder, or remove questions. Full editing (text, criteria, model answers) comes next.",
    "questions.add": "Add question",
    "questions.empty":
      "No questions yet. Add a question to start building this exam.",
    "questions.moveUp": "Move question up",
    "questions.moveDown": "Move question down",
    "questions.remove": "Remove question",
    "questions.removeTitle": "Remove question?",
    "questions.removeDescription":
      "This removes the question from this session. You can add it again later.",
    "questions.removeConfirm": "Remove",
    "questions.removeCancel": "Cancel",
    "questions.colType": "Type",
    "questions.colMarks": "Marks",
    "questions.edit": "Edit question",
    "session.field.examTitleSuggestions": "Quick suggestions",
    "session.examTitleSuggestion.first": "First exam",
    "session.examTitleSuggestion.second": "Second exam",
    "session.examTitleSuggestion.final": "Final exam",
    "session.examTitleSuggestion.midterm": "Mid-term exam",
    "questions.upload.sectionTitle": "Import questions from exam images or PDFs",
    "questions.upload.sectionHint":
      "Upload clear photos or PDF exam papers. PDFs are converted to page images in your browser, then sent once to OpenAI to rebuild editable questions and criteria — always review before grading.",
    "questions.upload.pickFiles": "Choose images or PDF",
    "questions.upload.fileTypesHint":
      "PNG, JPG, WebP, GIF, or PDF. Large PDFs are limited to the first pages (see app limits).",
    "questions.upload.extract": "Extract questions with AI",
    "questions.upload.extracting": "Reading exam pages…",
    "questions.upload.success":
      "Added extracted questions. Open each item to review wording and marks.",
    "questions.upload.error.generic":
      "Could not extract questions. Try sharper photos or fewer pages.",
    "questions.upload.error.noImages": "Add at least one image or PDF.",
    "questions.upload.error.tooMany": "Too many files selected. Reduce count or split across uploads.",
    "questions.upload.error.fileTooLarge": "One of the files is too large.",
    "questions.upload.error.tooManySlots":
      "Too many pages for one extraction after splitting PDFs. Use fewer files or a shorter PDF (fewer pages).",
    "questions.upload.replaceTitle": "Replace existing questions?",
    "questions.upload.replaceDescription":
      "This session already has questions. Extracting again will replace the whole list.",
    "questions.upload.replaceConfirm": "Replace all",
    "questions.upload.replaceCancel": "Cancel",
    "question.editor.title": "Edit question",
    "question.editor.subtitle":
      "Use the list arrows to change this question's position in the exam.",
    "question.editor.cancel": "Cancel",
    "question.editor.save": "Save",
    "question.field.questionNumber": "Question number",
    "question.field.title": "Question title",
    "question.field.body": "Question text",
    "question.field.type": "Question type",
    "question.field.totalMarks": "Total marks",
    "question.field.notes": "Notes (optional)",
    "question.field.modelAnswer": "Model answer",
    "question.type.multiple_choice": "Multiple choice",
    "question.type.short_answer": "Short answer",
    "question.type.long_answer": "Long answer",
    "question.type.code": "Code",
    "question.type.mixed": "Mixed",
    "question.type.file_based": "File-based",
    "criteria.sectionTitle": "Grading criteria",
    "criteria.sectionHint":
      "Add one row per rubric item. The sum of criterion marks must equal the question total.",
    "criteria.rowLabel": "Criterion",
    "criteria.remove": "Remove criterion",
    "criteria.add": "Add criterion",
    "criteria.field.title": "Criterion title",
    "criteria.field.description": "Description",
    "criteria.field.mark": "Mark",
    "question.validation.titleRequired": "Enter a question title.",
    "question.validation.totalMarkInteger":
      "Question total marks must be a positive whole number.",
    "question.validation.criteriaRequired":
      "Add at least one criterion with a title.",
    "question.validation.criterionTitle": "Every criterion needs a title.",
    "question.validation.criterionMarkInvalid":
      "Each criterion mark must be a whole number that is not negative.",
    "question.validation.criteriaSum":
      "Criterion marks do not add up to the question total.",
    "session.workspace.footerHint":
      "AI-assisted grading and exports will plug into this session in later steps.",
    "participants.sectionTitle": "Participants",
    "participants.sectionHint":
      "Track grading status and open a participant to paste answers or attach files.",
    "participants.add": "Add participant",
    "participants.empty":
      "No participants yet. Add someone to capture their submission.",
    "participants.open": "Open",
    "participants.colStatus": "Grading status",
    "participant.display.unlabeled": "Participant",
    "participant.dialog.title": "Add participant",
    "participant.dialog.description":
      "Provide at least one of name, university ID, or email.",
    "participant.dialog.submit": "Add",
    "participant.dialog.cancel": "Cancel",
    "participant.field.name": "Display name",
    "participant.field.universityId": "University ID",
    "participant.field.email": "Email",
    "participant.field.section": "Section (optional)",
    "participant.field.notes": "Notes (optional)",
    "participant.validation.identityRequired":
      "Enter a name, university ID, or email.",
    "participant.status.pending": "Pending",
    "participant.status.in_progress": "In progress",
    "participant.status.completed": "Completed",
    "participant.workspace.backSession": "Back to session",
    "participant.workspace.notFoundTitle": "Participant not found",
    "participant.workspace.notFoundBody":
      "This participant may have been removed from the session.",
    "participant.workspace.statusLabel": "Grading status",
    "participant.workspace.identityTitle": "Participant details",
    "participant.workspace.identityHint":
      "Identity fields were captured when this participant was added.",
    "submissions.cardTitle": "Submission",
    "submissions.cardHint":
      "Answer per question with text or attachments, or attach the whole exam (for example one or two PDFs). Then grade manually or with AI.",
    "submissions.sectionTitle": "Submission content",
    "submissions.sectionHint":
      "Saved locally in this browser. Large files are stored in IndexedDB.",
    "submissions.field.pastedText": "Pasted answer text",
    "submissions.field.upload": "Attachments",
    "submissions.uploadHint":
      "Photos, PDFs, and text files are supported. Multiple files allowed; removing an attachment deletes its stored copy when you save.",
    "submissions.uploadHintCombined":
      "Ideal for scans of the full exam in one or two files; every question’s AI grading uses this whole packet.",
    "submissions.layoutModeLabel": "How are answers organized?",
    "submissions.layoutCombined": "Whole exam (paste + attachments)",
    "submissions.layoutPerQuestion": "Per exam question",
    "submissions.layoutPerQuestionDisabledHint":
      "Add exam questions to this session before using per-question submissions.",
    "submissions.layoutCombinedHint":
      "Paste text and/or attach files once; the model sees the full submission when grading each question.",
    "submissions.layoutPerQuestionHint":
      "For each question choose text or an attachment; AI grading sends only that question’s slice.",
    "submissions.perQuestionNoExamQuestions":
      "This session has no exam questions yet — use combined submission or add questions first.",
    "submissions.perQuestionIntro":
      "Choose Text or Attachment for each question, enter content, save, then grade below.",
    "submissions.answerAsText": "Text",
    "submissions.answerAsAttachment": "Attachment",
    "submissions.perQuestionTextLabel": "Answer text",
    "submissions.perQuestionTextPlaceholder":
      "Type or paste this question’s answer…",
    "submissions.afterAnswerGradeHint":
      "After saving, scroll to grading and choose Grade manually or Grade with AI.",
    "submissions.perQuestionAttachmentHint":
      "Upload photo(s), PDF, or text for this question only.",
    "submissions.pastePlaceholder":
      "Paste the learner's submission text here…",
    "submissions.chooseFiles": "Choose files",
    "submissions.pendingUpload": "Not saved yet",
    "submissions.save": "Save submission",
    "submissions.saving": "Saving…",
    "submissions.filesTitle": "Files",
    "submissions.removeFile": "Remove file",
    "submissions.downloadFile": "Download",
    "submissions.emptyFiles":
      "No attachments yet. Use Choose files or paste text above.",
    "submissions.error.noIndexedDb":
      "File attachments require IndexedDB in this browser.",
    "submissions.error.saveFailed":
      "Could not save submission or attachments. Try again.",
    "grading.sectionTitle": "AI-assisted grading",
    "grading.sectionHint":
      "Grade one question or the whole exam; pasted text, photos, and PDF pages are sent to the model when you grade. Review marks and feedback, then save.",
    "grading.noQuestions":
      "No exam questions in this session yet. Add questions before grading.",
    "grading.loadingSubmission": "Loading submission text for prompts…",
    "grading.noApiKey": "Add an OpenAI API key to run AI grading.",
    "grading.openSettings": "Open settings",
    "grading.weakSubmissionHint":
      "Nothing usable was found to send to the model (no pasted text, readable files, or supported photos/PDF pages). Add content before grading.",
    "grading.attemptsLabel": "API attempts used:",
    "grading.totalScoreLabel": "Session total (sum of questions)",
    "grading.noCriteria": "This question has no rubric criteria.",
    "grading.gradingBusy": "Grading…",
    "grading.gradeWithAi": "Grade with AI",
    "grading.gradeAllWithAi": "Grade all questions with AI",
    "grading.gradeAllBusy": "Grading all…",
    "grading.gradeManually": "Grade manually",
    "grading.questionScoreSuffix": "marks awarded for this question",
    "grading.criterionMark": "Mark",
    "grading.criterionReasoning": "Reasoning / notes",
    "grading.questionFeedback": "Feedback for this question",
    "grading.overallFeedback": "Overall feedback (participant)",
    "grading.overallFeedbackHint":
      "Optional summary across questions; saved with your grading record.",
    "grading.saveProgress": "Save grading progress",
    "grading.source.ai": "AI",
    "grading.source.manual": "Manual",
    "grading.source.mixed": "Mixed",
    "participants.results": "Results",
    "participants.remove": "Remove participant",
    "participants.removeTitle": "Remove participant?",
    "participants.removeDescription":
      "This deletes their submission and grading data for this session. This cannot be undone.",
    "participants.removeConfirm": "Remove",
    "participants.removeCancel": "Cancel",
    "participant.results.shortcut": "Open results breakdown",
    "participant.results.title": "Participant results",
    "participant.results.subtitle": "Scores and feedback saved for this session",
    "participant.results.backParticipant": "Back to participant workspace",
    "participant.results.identityHint": "Identity from when this participant was added.",
    "participant.results.scoreSummaryTitle": "Score summary",
    "participant.results.scoreSummaryHint":
      "Total reflects saved grading for this participant.",
    "participant.results.noGrading":
      "No grading saved yet. Grade from the participant workspace.",
    "participant.results.overallFeedbackTitle": "Overall feedback",
    "participant.results.perQuestionTitle": "By question",
    "participant.results.marksForQuestion": "marks for this question",
    "participant.results.notGradedYet": "Not graded yet",
    "participant.results.criterionCol": "Criterion",
    "participant.results.markCol": "Mark",
    "participant.results.questionFeedbackTitle": "Question feedback",
    "results.session.title": "Results & export",
    "results.session.hint":
      "Track grading coverage per participant and download Excel summaries.",
    "results.session.coverageTitle": "Session grading coverage",
    "results.session.coverageHint":
      "Counts answered question slots (each participant × each exam question with saved grading).",
    "results.session.noParticipants":
      "Add participants to see progress and export rows.",
    "results.session.colParticipant": "Participant",
    "results.session.colProgress": "Question progress",
    "results.session.colTotal": "Total score",
    "results.session.colActions": "Actions",
    "results.session.breakdown": "Breakdown",
    "results.session.workspace": "Workspace",
    "results.session.exportSimple": "Export simple Excel",
    "results.session.exportDetailed": "Export detailed Excel",
    "results.export.simpleSheet": "Simple results",
    "results.export.detailedSheet": "Detailed results",
    "results.export.colName": "Participant name",
    "results.export.colUniversityId": "University ID",
    "results.export.colEmail": "Email",
    "results.export.colTotalScore": "Total score",
    "results.export.colOverallFeedback": "Overall feedback",
    "results.export.questionScoreShort": "Q",
    "results.export.colQuestionNumber": "Question number",
    "results.export.colQuestionTitle": "Question title",
    "results.export.colQuestionAwarded": "Question marks awarded",
    "results.export.colQuestionMax": "Question marks max",
    "results.export.colCriterionTitle": "Criterion title",
    "results.export.colCriterionAwarded": "Criterion marks awarded",
    "results.export.colCriterionMax": "Criterion marks max",
    "results.export.colCriterionReasoning": "Criterion reasoning",
    "results.export.colQuestionFeedback": "Question feedback",
    "results.export.colGradedAt": "Graded at (ISO)",
    "dashboard.quick.newSession": "New session",
    "dashboard.quick.continue": "Continue last session",
    "dashboard.quick.continueNone": "No recent session yet",
    "dashboard.recent.title": "Recent sessions",
    "dashboard.recent.empty":
      "No sessions yet. Start with a new grading session.",
    "dashboard.recent.untitled": "Untitled session",
    "dashboard.recent.deleteAria": "Delete session",
    "dashboard.recent.deleteTitle": "Delete this session?",
    "dashboard.recent.deleteDescription":
      "This removes the session, all participants, grading progress, and stored submission files from this browser. This cannot be undone.",
    "dashboard.recent.deleteConfirm": "Delete session",
    "dashboard.recent.deleteCancel": "Cancel",
    "theme.toggleLight": "Switch to light theme",
    "theme.toggleDark": "Switch to dark theme",
    "language.label": "Language",
    "placeholder.newSession":
      "Session creation will go here — exam details, preferences, and questions.",
    "placeholder.sessionWorkspace":
      "Session workspace — participants, submissions, and grading will appear here.",
    "common.loading": "Loading…",
    "common.redirecting": "Redirecting…",
    "apiKey.warning.title": "Important",
    "apiKey.warning.browser":
      "Your API key is stored only in this browser (localStorage). It is sent directly from your browser to OpenAI when you grade. Do not use a production or shared key here — browser usage is best treated as personal/local tooling.",
    "apiKey.error.empty": "Enter your OpenAI API key.",
    "apiKey.error.format":
      "That key does not look like a typical OpenAI secret key (expected to start with sk-).",
    "apiKey.error.auth":
      "OpenAI rejected this key (unauthorized). Check the key and try again.",
    "apiKey.error.http":
      "OpenAI returned an unexpected response. Try again in a moment.",
    "apiKey.error.network":
      "Could not reach OpenAI from this browser (network/CORS/offline). If this persists, your browser may be blocking the request.",
    "apiKey.error.generic": "Something went wrong while validating the key.",
    "apiKey.success.test": "Key looks valid.",
    "onboarding.title": "Connect OpenAI",
    "onboarding.description":
      "AI-assisted grading needs your OpenAI API key. It stays on this device only unless your browser syncs storage.",
    "onboarding.fieldLabel": "OpenAI API key",
    "onboarding.fieldPlaceholder": "sk-…",
    "onboarding.test": "Test API key",
    "onboarding.continue": "Continue to app",
    "settings.pageTitle": "Settings",
    "settings.api.title": "OpenAI API key",
    "settings.api.hint":
      "Update or remove your key anytime. Removing it will send you back to setup.",
    "settings.api.stored": "A key is saved locally.",
    "settings.api.noneStored": "No key saved.",
    "settings.api.newPlaceholder": "Paste a new sk-… key",
    "settings.api.save": "Save key",
    "settings.api.remove": "Remove key",
    "settings.api.retest": "Test key",
    "settings.api.removeTitle": "Remove API key?",
    "settings.api.removeDescription":
      "Grading will be unavailable until you add a key again.",
    "settings.api.removeConfirm": "Remove",
    "settings.api.removeCancel": "Cancel",
    "settings.otherComing":
      "Theme and language use the header controls. More settings will land here soon.",
  },
  ar: {
    "nav.primary": "التنقل الرئيسي",
    "nav.menu": "القائمة",
    "nav.openMenu": "فتح قائمة التنقل",
    "nav.skipToContent": "تخطي إلى المحتوى الرئيسي",
    "nav.dashboard": "لوحة التحكم",
    "nav.settings": "الإعدادات",
    "nav.sessions": "الجلسات",
    "dashboard.title": "لوحة التحكم",
    "dashboard.subtitle":
      "أنشئ جلسات التصحيح، التقط التسليمات، وصدّر النتائج — كل ذلك من المتصفح.",
    "dashboard.metric.sessions": "جلسات التصحيح",
    "dashboard.metric.graded": "المشاركون المصحَّحون",
    "dashboard.metric.hint": "تُخزَّن البيانات محليًا في متصفحك.",
    "dashboard.metric.sessionsDetail":
      "عدد جلسات التصحيح المحفوظة في هذا المتصفح.",
    "dashboard.metric.gradedDetail":
      "يُحسب المشاركون الذين أُشير إلى أنهم مكتملو التصحيح عبر كل الجلسات.",
    "prefs.strictness.easy": "سهل",
    "prefs.strictness.balanced": "متوازن",
    "prefs.strictness.strict": "صارم",
    "prefs.student.beginner": "مبتدئ",
    "prefs.student.intermediate": "متوسط",
    "prefs.student.advanced": "متقدم",
    "prefs.exam.easy": "سهل",
    "prefs.exam.medium": "متوسط",
    "prefs.exam.hard": "صعب",
    "prefs.feedback.short": "قصير",
    "prefs.feedback.balanced": "متوازن",
    "prefs.feedback.detailed": "مفصل",
    "session.new.title": "إنشاء جلسة تصحيح",
    "session.new.subtitle":
      "أضف تفاصيل الامتحان وتفضيلات الأستاذ. الأسئلة والمشاركون في الخطوة التالية.",
    "session.section.exam": "إعداد الامتحان",
    "session.section.examHint":
      "الحقول المطلوبة تُحفظ محليًا ضمن هذه الجلسة.",
    "session.section.prefs": "تفضيلات الأستاذ",
    "session.section.prefsHint":
      "تُدرَج هذه الإعدادات في مطالبات التصحيح بالذكاء الاصطناعي لهذه الجلسة.",
    "session.field.examTitle": "عنوان الامتحان",
    "session.field.courseName": "اسم المقرر",
    "session.field.examDate": "تاريخ الامتحان",
    "session.field.totalMarks": "مجموع الدرجات",
    "session.field.primaryLanguage": "لغة الامتحان",
    "session.field.primaryLanguageHint":
      "تُستخدم للتصحيح بالذكاء الاصطناعي ولاستيراد المسوحات: لغة الملاحظات وتوقع اللغة على الأوراق.",
    "session.examLanguage.auto": "تلقائي — مطابقة لغة إجابة المتعلّم",
    "session.examLanguage.en": "الإنجليزية",
    "session.examLanguage.ar": "العربية",
    "session.examLanguage.fr": "الفرنسية",
    "session.examLanguage.mixed": "مختلط / ثنائي اللغة على الورقة",
    "session.field.notes": "ملاحظات (اختياري)",
    "session.prefs.strictness": "صرامة التصحيح",
    "session.prefs.studentLevel": "مستوى الطالب",
    "session.prefs.examLevel": "صعوبة الامتحان",
    "session.prefs.feedbackStyle": "أسلوب الملاحظات",
    "session.submit": "إنشاء الجلسة",
    "session.submitting": "جاري إنشاء الجلسة…",
    "session.cancel": "العودة إلى لوحة التحكم",
    "session.error.save":
      "تعذَّر حفظ الجلسة. تحقَّق من أذونات التخزين أو المساحة المتاحة.",
    "session.validation.title": "تحقق من الحقول",
    "session.validation.required":
      "يرجى تعبئة عنوان الامتحان والمقرر والتاريخ ومجموع درجات صالح.",
    "session.validation.marks": "يجب أن يكون مجموع الدرجات عددًا صحيحًا موجبًا.",
    "session.workspace.invalid": "رابط الجلسة غير صالح.",
    "session.workspace.backDashboard": "العودة إلى لوحة التحكم",
    "session.workspace.notFoundTitle": "الجلسة غير موجودة",
    "session.workspace.notFoundBody":
      "ربما حُذفت من تخزين المتصفح أو أن الرابط قديمًا.",
    "session.workspace.summaryTitle": "نظرة عامة على الجلسة",
    "session.workspace.summaryHint":
      "ما سيُستخدم لاحقًا للتصحيح بالذكاء الاصطناعي وللتصدير.",
    "session.workspace.editSession": "تعديل تفاصيل الجلسة",
    "session.workspace.editSessionHint":
      "حدِّث عنوان الامتحان والمقرر والتاريخ ومجموع الدرجات ولغة الامتحان والملاحظات وتفضيلات التصحيح. التعديلات لهذه الجلسة فقط.",
    "session.workspace.saveChanges": "حفظ التغييرات",
    "session.workspace.course": "المقرر",
    "session.workspace.examDate": "تاريخ الامتحان",
    "session.workspace.totalMarks": "مجموع الدرجات",
    "session.workspace.updated": "آخر تحديث",
    "questions.sectionTitle": "الأسئلة",
    "questions.sectionHint":
      "أضِف أو أعد ترتيب الأسئلة أو احذفها. التحرير الكامل (النص، المعايير، الإجابات النموذجية) في الخطوة التالية.",
    "questions.add": "إضافة سؤال",
    "questions.empty": "لا توجد أسئلة بعد. أضف سؤالًا لبدء بناء هذا الامتحان.",
    "questions.moveUp": "تحريك السؤال لأعلى",
    "questions.moveDown": "تحريك السؤال لأسفل",
    "questions.remove": "حذف السؤال",
    "questions.removeTitle": "حذف السؤال؟",
    "questions.removeDescription":
      "سيُزال السؤال من هذه الجلسة. يمكنك إضافته لاحقًا مجددًا.",
    "questions.removeConfirm": "حذف",
    "questions.removeCancel": "إلغاء",
    "questions.colType": "النوع",
    "questions.colMarks": "الدرجات",
    "questions.edit": "تحرير السؤال",
    "session.field.examTitleSuggestions": "اقتراحات سريعة",
    "session.examTitleSuggestion.first": "الاختبار الأول",
    "session.examTitleSuggestion.second": "الاختبار الثاني",
    "session.examTitleSuggestion.final": "الاختبار النهائي",
    "session.examTitleSuggestion.midterm": "اختبار منتصف الفصل",
    "questions.upload.sectionTitle": "استيراد الأسئلة من صور أو PDF",
    "questions.upload.sectionHint":
      "ارفع صورًا واضحة أو ملف PDF للامتحان. يُحوَّل PDF إلى صفحات صور في المتصفح، ثم يُرسَل مرة واحدة إلى OpenAI لإعادة بناء الأسئلة والمعايير — راجع النتيجة دائمًا قبل التصحيح.",
    "questions.upload.pickFiles": "اختيار صور أو PDF",
    "questions.upload.fileTypesHint":
      "PNG أو JPG أو WebP أو GIF أو PDF. يُقتصر ملف PDF الطويل على أول صفحات ضمن حدود التطبيق.",
    "questions.upload.extract": "استخراج الأسئلة بالذكاء الاصطناعي",
    "questions.upload.extracting": "جاري قراءة صفحات الامتحان…",
    "questions.upload.success":
      "تمت إضافة الأسئلة المستخرجة. افتح كل عنصر لمراجعة الصياغة والدرجات.",
    "questions.upload.error.generic":
      "تعذّر استخراج الأسئلة. جرّب صورًا أوضح أو عدد صفحات أقل.",
    "questions.upload.error.noImages": "أضِف صورة واحدة على الأقل أو ملف PDF.",
    "questions.upload.error.tooMany":
      "عدد الملفات كبير جدًا. قلّل العدد أو قسّم الرفع على أكثر من مرة.",
    "questions.upload.error.fileTooLarge": "أحد الملفات كبير جدًا.",
    "questions.upload.error.tooManySlots":
      "عدد الصفحات بعد تقسيم ملفات PDF كبير جدًا لهذا الطلب. قلّل الملفات أو استخدم ملف PDF أقصر.",
    "questions.upload.replaceTitle": "استبدال الأسئلة الحالية؟",
    "questions.upload.replaceDescription":
      "تحتوي هذه الجلسة على أسئلة بالفعل. الاستخراج مجددًا سيستبدل القائمة بالكامل.",
    "questions.upload.replaceConfirm": "استبدال الكل",
    "questions.upload.replaceCancel": "إلغاء",
    "question.editor.title": "تحرير السؤال",
    "question.editor.subtitle":
      "استخدم الأسهم في القائمة لتغيير موضع هذا السؤال في الامتحان.",
    "question.editor.cancel": "إلغاء",
    "question.editor.save": "حفظ",
    "question.field.questionNumber": "رقم السؤال",
    "question.field.title": "عنوان السؤال",
    "question.field.body": "نص السؤال",
    "question.field.type": "نوع السؤال",
    "question.field.totalMarks": "مجموع الدرجات",
    "question.field.notes": "ملاحظات (اختياري)",
    "question.field.modelAnswer": "إجابة نموذجية",
    "question.type.multiple_choice": "اختيار من متعدد",
    "question.type.short_answer": "إجابة قصيرة",
    "question.type.long_answer": "إجابة طويلة",
    "question.type.code": "برمجة / كود",
    "question.type.mixed": "مختلط",
    "question.type.file_based": "ملف مرفق",
    "criteria.sectionTitle": "معايير التصحيح",
    "criteria.sectionHint":
      "أضف صفًا لكل بند في السلم. يجب أن يساوي مجموع درجات البنود مجموع درجات السؤال.",
    "criteria.rowLabel": "معيار",
    "criteria.remove": "إزالة المعيار",
    "criteria.add": "إضافة معيار",
    "criteria.field.title": "عنوان المعيار",
    "criteria.field.description": "الوصف",
    "criteria.field.mark": "الدرجة",
    "question.validation.titleRequired": "أدخل عنوانًا للسؤال.",
    "question.validation.totalMarkInteger":
      "يجب أن يكون مجموع درجات السؤال عددًا صحيحًا موجبًا.",
    "question.validation.criteriaRequired":
      "أضف معيارًا واحدًا على الأقل يحمل عنوانًا.",
    "question.validation.criterionTitle": "كل معيار يجب أن يكون له عنوان.",
    "question.validation.criterionMarkInvalid":
      "درجة كل معيار يجب أن تكون عددًا صحيحًا غير سالب.",
    "question.validation.criteriaSum":
      "مجموع درجات المعايير لا يطابق مجموع درجات السؤال.",
    "session.workspace.footerHint":
      "سيُربط التصحيح بالذكاء الاصطناعي والتصدير بهذه الجلسة في خطوات لاحقة.",
    "participants.sectionTitle": "المشاركون",
    "participants.sectionHint":
      "تابع حالة التصحيح وافتح مشاركًا للصق الإجابات أو إرفاق الملفات.",
    "participants.add": "إضافة مشارك",
    "participants.empty":
      "لا يوجد مشاركون بعد. أضِف مشاركًا لالتقاط تسليمه.",
    "participants.open": "فتح",
    "participants.colStatus": "حالة التصحيح",
    "participant.display.unlabeled": "مشارك",
    "participant.dialog.title": "إضافة مشارك",
    "participant.dialog.description":
      "أدخل على الأقل واحدًا من: الاسم، الرقم الجامعي، أو البريد الإلكتروني.",
    "participant.dialog.submit": "إضافة",
    "participant.dialog.cancel": "إلغاء",
    "participant.field.name": "الاسم الظاهر",
    "participant.field.universityId": "الرقم الجامعي",
    "participant.field.email": "البريد الإلكتروني",
    "participant.field.section": "الشعبة (اختياري)",
    "participant.field.notes": "ملاحظات (اختياري)",
    "participant.validation.identityRequired":
      "أدخل اسمًا أو رقمًا جامعيًا أو بريدًا إلكترونيًا.",
    "participant.status.pending": "معلق",
    "participant.status.in_progress": "قيد التصحيح",
    "participant.status.completed": "مكتمل",
    "participant.workspace.backSession": "العودة إلى الجلسة",
    "participant.workspace.notFoundTitle": "المشارك غير موجود",
    "participant.workspace.notFoundBody":
      "ربما أُزيل هذا المشارك من الجلسة.",
    "participant.workspace.statusLabel": "حالة التصحيح",
    "participant.workspace.identityTitle": "تفاصيل المشارك",
    "participant.workspace.identityHint":
      "تم تسجيل حقول الهوية عند إضافة هذا المشارك.",
    "submissions.cardTitle": "التسليم",
    "submissions.cardHint":
      "أجب حسب السؤال كنص أو مرفق، أو أرفق الامتحان كاملًا (مثل ملفّي PDF). ثم صحِّح يدويًا أو بالذكاء الاصطناعي.",
    "submissions.sectionTitle": "محتوى التسليم",
    "submissions.sectionHint":
      "يُحفظ محليًا في هذا المتصفح. الملفات الكبيرة تُخزَّن في IndexedDB.",
    "submissions.field.pastedText": "نص الإجابة المنسوخ",
    "submissions.field.upload": "المرفقات",
    "submissions.uploadHint":
      "تُدعم الصور وPDF والملفات النصية. يمكن اختيار عدة ملفات؛ إزالة مرفق تحذف نسخته المخزنة عند الحفظ.",
    "submissions.uploadHintCombined":
      "مناسب لمسح ضوئي للامتحان كامل في ملف أو ملفين؛ التصحيح بالذكاء الاصطناعي يستخدم الحزمة كلها لكل سؤال.",
    "submissions.layoutModeLabel": "كيف تُنظَّم الإجابات؟",
    "submissions.layoutCombined": "الامتحان كاملًا (لصق + مرفقات)",
    "submissions.layoutPerQuestion": "لكل سؤال من الامتحان",
    "submissions.layoutPerQuestionDisabledHint":
      "أضف أسئلة الامتحان لهذه الجلسة قبل استخدام التسليم لكل سؤال.",
    "submissions.layoutCombinedHint":
      "الصق النص و/أو أرفق الملفات مرة واحدة؛ النموذج يرى التسليم الكامل عند تصحيح كل سؤال.",
    "submissions.layoutPerQuestionHint":
      "لكل سؤال اختر نصًا أو مرفقًا؛ التصحيح بالذكاء الاصطناعي يرسل جزء ذلك السؤال فقط.",
    "submissions.perQuestionNoExamQuestions":
      "لا توجد أسئلة امتحان في هذه الجلسة بعد — استخدم التسليم الموحَّد أو أضف أسئلة أولًا.",
    "submissions.perQuestionIntro":
      "اختر نصًا أو مرفقًا لكل سؤال، أدخل المحتوى، احفظ، ثم صحِّح بالأسفل.",
    "submissions.answerAsText": "نص",
    "submissions.answerAsAttachment": "مرفق",
    "submissions.perQuestionTextLabel": "نص الإجابة",
    "submissions.perQuestionTextPlaceholder": "اكتب أو الصق إجابة هذا السؤال…",
    "submissions.afterAnswerGradeHint":
      "بعد الحفظ، انتقل للتصحيح واختر التصحيح اليدوي أو بالذكاء الاصطناعي.",
    "submissions.perQuestionAttachmentHint":
      "ارفع صورة أو PDF أو ملفًا نصيًا لهذا السؤال فقط.",
    "submissions.pastePlaceholder": "الصق نص تسليم المتعلّم هنا…",
    "submissions.chooseFiles": "اختيار ملفات",
    "submissions.pendingUpload": "لم يُحفظ بعد",
    "submissions.save": "حفظ التسليم",
    "submissions.saving": "جاري الحفظ…",
    "submissions.filesTitle": "الملفات",
    "submissions.removeFile": "إزالة الملف",
    "submissions.downloadFile": "تنزيل",
    "submissions.emptyFiles":
      "لا توجد مرفقات بعد. استخدم اختيار الملفات أو الصق النص أعلاه.",
    "submissions.error.noIndexedDb":
      "مرفقات الملفات تتطلب IndexedDB في هذا المتصفح.",
    "submissions.error.saveFailed":
      "تعذَّر حفظ التسليم أو المرفقات. حاول مجددًا.",
    "grading.sectionTitle": "التصحيح بمساعدة الذكاء الاصطناعي",
    "grading.sectionHint":
      "صحِّح سؤالًا واحدًا أو الامتحان كاملًا؛ يُرسَل النص المنسوخ والصور وصفحات PDF إلى النموذج عند التصحيح. راجع الدرجات والملاحظات ثم احفظ.",
    "grading.noQuestions":
      "لا توجد أسئلة امتحان في هذه الجلسة بعد. أضف أسئلة قبل التصحيح.",
    "grading.loadingSubmission": "جاري تحميل نص التسليم للمطالبات…",
    "grading.noApiKey": "أضف مفتاح OpenAI لتشغيل التصحيح بالذكاء الاصطناعي.",
    "grading.openSettings": "فتح الإعدادات",
    "grading.weakSubmissionHint":
      "لم يُعثر على محتوى يمكن إرساله إلى النموذج (لا نصًا ملصوقًا ولا ملفات مقروءة ولا صورًا/PDF مدعومة). أضف محتوى قبل التصحيح.",
    "grading.attemptsLabel": "عدد محاولات واجهة البرمجة:",
    "grading.totalScoreLabel": "مجموع الجلسة (مجموع الأسئلة)",
    "grading.noCriteria": "لا يوجد معايير سلم لهذا السؤال.",
    "grading.gradingBusy": "جاري التصحيح…",
    "grading.gradeWithAi": "تصحيح بالذكاء الاصطناعي",
    "grading.gradeAllWithAi": "تصحيح كل الأسئلة بالذكاء الاصطناعي",
    "grading.gradeAllBusy": "جاري تصحيح الكل…",
    "grading.gradeManually": "تصحيح يدوي",
    "grading.questionScoreSuffix": "درجة هذا السؤال",
    "grading.criterionMark": "الدرجة",
    "grading.criterionReasoning": "التعليل / ملاحظات",
    "grading.questionFeedback": "ملاحظات هذا السؤال",
    "grading.overallFeedback": "ملاحظات عامة (المشارك)",
    "grading.overallFeedbackHint":
      "ملخص اختياري عبر الأسئلة؛ يُحفظ مع سجل التصحيح.",
    "grading.saveProgress": "حفظ تقدم التصحيح",
    "grading.source.ai": "ذكاء اصطناعي",
    "grading.source.manual": "يدوي",
    "grading.source.mixed": "مختلط",
    "participants.results": "النتائج",
    "participants.remove": "إزالة المشارك",
    "participants.removeTitle": "إزالة المشارك؟",
    "participants.removeDescription":
      "سيؤدي ذلك إلى حذف تسليمه وبيانات التصحيح لهذه الجلسة. لا يمكن التراجع عن ذلك.",
    "participants.removeConfirm": "إزالة",
    "participants.removeCancel": "إلغاء",
    "participant.results.shortcut": "فتح تفصيل النتائج",
    "participant.results.title": "نتائج المشارك",
    "participant.results.subtitle": "الدرجات والملاحظات المحفوظة لهذه الجلسة",
    "participant.results.backParticipant": "العودة إلى مساحة المشارك",
    "participant.results.identityHint": "الهوية كما عند إضافة المشارك.",
    "participant.results.scoreSummaryTitle": "ملخص الدرجات",
    "participant.results.scoreSummaryHint":
      "المجموع يعكس التصحيح المحفوظ لهذا المشارك.",
    "participant.results.noGrading":
      "لا يوجد تصحيح محفوظ بعد. صحِّح من مساحة المشارك.",
    "participant.results.overallFeedbackTitle": "ملاحظات عامة",
    "participant.results.perQuestionTitle": "حسب السؤال",
    "participant.results.marksForQuestion": "درجات هذا السؤال",
    "participant.results.notGradedYet": "لم يُصحَّح بعد",
    "participant.results.criterionCol": "المعيار",
    "participant.results.markCol": "الدرجة",
    "participant.results.questionFeedbackTitle": "ملاحظات السؤال",
    "results.session.title": "النتائج والتصدير",
    "results.session.hint":
      "تابع تغطية التصحيح لكل مشارك وحمِّل ملخصات Excel.",
    "results.session.coverageTitle": "تغطية تصحيح الجلسة",
    "results.session.coverageHint":
      "يُحسب عدد خانات الأسئلة المُجابة (كل مشارك × كل سؤال بتصحيح محفوظ).",
    "results.session.noParticipants":
      "أضِف مشاركين لعرض التقدم وصفوف التصدير.",
    "results.session.colParticipant": "المشارك",
    "results.session.colProgress": "تقدم الأسئلة",
    "results.session.colTotal": "المجموع",
    "results.session.colActions": "إجراءات",
    "results.session.breakdown": "التفصيل",
    "results.session.workspace": "المساحة",
    "results.session.exportSimple": "تصدير Excel بسيط",
    "results.session.exportDetailed": "تصدير Excel مفصل",
    "results.export.simpleSheet": "نتائج بسيطة",
    "results.export.detailedSheet": "نتائج مفصلة",
    "results.export.colName": "اسم المشارك",
    "results.export.colUniversityId": "الرقم الجامعي",
    "results.export.colEmail": "البريد الإلكتروني",
    "results.export.colTotalScore": "المجموع",
    "results.export.colOverallFeedback": "ملاحظات عامة",
    "results.export.questionScoreShort": "س",
    "results.export.colQuestionNumber": "رقم السؤال",
    "results.export.colQuestionTitle": "عنوان السؤال",
    "results.export.colQuestionAwarded": "درجات السؤال المعطاة",
    "results.export.colQuestionMax": "درجات السؤال القصوى",
    "results.export.colCriterionTitle": "عنوان المعيار",
    "results.export.colCriterionAwarded": "درجات المعيار المعطاة",
    "results.export.colCriterionMax": "درجات المعيار القصوى",
    "results.export.colCriterionReasoning": "تعليل المعيار",
    "results.export.colQuestionFeedback": "ملاحظات السؤال",
    "results.export.colGradedAt": "وقت التصحيح (ISO)",
    "dashboard.quick.newSession": "جلسة جديدة",
    "dashboard.quick.continue": "متابعة آخر جلسة",
    "dashboard.quick.continueNone": "لا توجد جلسة حديثة بعد",
    "dashboard.recent.title": "الجلسات الأخيرة",
    "dashboard.recent.empty":
      "لا توجد جلسات بعد. ابدأ بإنشاء جلسة تصحيح جديدة.",
    "dashboard.recent.untitled": "جلسة بلا عنوان",
    "dashboard.recent.deleteAria": "حذف الجلسة",
    "dashboard.recent.deleteTitle": "حذف هذه الجلسة؟",
    "dashboard.recent.deleteDescription":
      "سيُزال الملف المحلي للجلسة وجميع المشاركين وحالة التصحيح وملفات التسليم المخزنة في هذا المتصفح. لا يمكن التراجع عن ذلك.",
    "dashboard.recent.deleteConfirm": "حذف الجلسة",
    "dashboard.recent.deleteCancel": "إلغاء",
    "theme.toggleLight": "التبديل إلى الوضع الفاتح",
    "theme.toggleDark": "التبديل إلى الوضع الداكن",
    "language.label": "اللغة",
    "placeholder.newSession":
      "سيُنشأ إنشاء الجلسة هنا — تفاصيل الامتحان والتفضيلات والأسئلة.",
    "placeholder.sessionWorkspace":
      "مساحة الجلسة — سيظهر هنا المشاركون والتسليمات والتصحيح.",
    "common.loading": "جاري التحميل…",
    "common.redirecting": "جاري إعادة التوجيه…",
    "apiKey.warning.title": "تنبيه مهم",
    "apiKey.warning.browser":
      "يُخزَّن مفتاح واجهة برمجة التطبيقات في هذا المتصفح فقط (التخزين المحلي). يُرسَل مباشرةً من متصفحك إلى OpenAI عند التصحيح. لا تستخدم مفتاحًا إنتاجيًا أو مشتركًا هنا — الاستخدام من المتصفح يُعامل كأداة شخصية/محلية.",
    "apiKey.error.empty": "أدخل مفتاح OpenAI.",
    "apiKey.error.format":
      "لا يبدو المفتاح كمفتاح OpenAI النموذجي (يُفترض أن يبدأ بـ sk-).",
    "apiKey.error.auth":
      "رفض OpenAI هذا المفتاح (غير مصرَّح). تحقق من المفتاح وحاول مجددًا.",
    "apiKey.error.http":
      "أعاد OpenAI استجابة غير متوقعة. حاول بعد قليل.",
    "apiKey.error.network":
      "تعذَّر الوصول إلى OpenAI من هذا المتصفح (شبكة/CORS/لا اتصال). إذا استمر ذلك، قد يكون المتصفح يمنع الطلب.",
    "apiKey.error.generic": "حدث خطأ أثناء التحقق من المفتاح.",
    "apiKey.success.test": "يبدو المفتاح صالحًا.",
    "onboarding.title": "ربط OpenAI",
    "onboarding.description":
      "التصحيح بمساعدة الذكاء الاصطناعي يحتاج مفتاح OpenAI. يبقى على هذا الجهاز فقط ما لم يُزامن المتصفح التخزين.",
    "onboarding.fieldLabel": "مفتاح OpenAI",
    "onboarding.fieldPlaceholder": "sk-…",
    "onboarding.test": "اختبار المفتاح",
    "onboarding.continue": "متابعة إلى التطبيق",
    "settings.pageTitle": "الإعدادات",
    "settings.api.title": "مفتاح OpenAI",
    "settings.api.hint":
      "يمكنك تحديث المفتاح أو حذفه في أي وقت. حذفه يعيدك إلى صفحة الإعداد الأولى.",
    "settings.api.stored": "تم حفظ مفتاح محليًا.",
    "settings.api.noneStored": "لا يوجد مفتاح محفوظ.",
    "settings.api.newPlaceholder": "الصق مفتاحًا جديدًا sk-…",
    "settings.api.save": "حفظ المفتاح",
    "settings.api.remove": "إزالة المفتاح",
    "settings.api.retest": "اختبار المفتاح",
    "settings.api.removeTitle": "إزالة مفتاح واجهة البرمجة؟",
    "settings.api.removeDescription":
      "لن يكون التصحيح متاحًا حتى تُضيف مفتاحًا من جديد.",
    "settings.api.removeConfirm": "إزالة",
    "settings.api.removeCancel": "إلغاء",
    "settings.otherComing":
      "المظهر واللغة من عناصر التحكم في الشريط. ستُضاف إعدادات أخرى هنا لاحقًا.",
  },
};
