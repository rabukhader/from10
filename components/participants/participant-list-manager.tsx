"use client";

import * as React from "react";
import Link from "next/link";
import { PlusIcon, Trash2Icon } from "lucide-react";

import type { GradingSessionDocument, Participant } from "@/src/domain";
import { labelParticipantGradingStatus } from "@/src/lib/i18n/participant-labels";
import { participantPrimaryLabel } from "@/src/lib/participants";
import { saveSession } from "@/src/lib/storage/session-repository";

import { AddParticipantDialog } from "@/components/participants/add-participant-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useLocale } from "@/components/providers/locale-provider";

import { cn } from "@/lib/utils";

function persistParticipants(
  doc: GradingSessionDocument,
  participants: Participant[],
): GradingSessionDocument {
  const nextIds = new Set(participants.map((p) => p.id));
  const submissionsByParticipantId = { ...doc.submissionsByParticipantId };
  const gradingByParticipantId = { ...doc.gradingByParticipantId };
  for (const id of Object.keys(submissionsByParticipantId)) {
    if (!nextIds.has(id)) delete submissionsByParticipantId[id];
  }
  for (const id of Object.keys(gradingByParticipantId)) {
    if (!nextIds.has(id)) delete gradingByParticipantId[id];
  }
  const next: GradingSessionDocument = {
    ...doc,
    participants,
    submissionsByParticipantId,
    gradingByParticipantId,
    updatedAt: new Date().toISOString(),
  };
  return saveSession(next);
}

function gradingStatusBadgeVariant(
  status: Participant["gradingStatus"],
): "outline" | "secondary" | "default" {
  switch (status) {
    case "completed":
      return "default";
    case "in_progress":
      return "secondary";
    default:
      return "outline";
  }
}

export function ParticipantListManager({
  doc,
  onDocumentChange,
}: Readonly<{
  doc: GradingSessionDocument;
  onDocumentChange: (next: GradingSessionDocument) => void;
}>) {
  const { t } = useLocale();
  const [addOpen, setAddOpen] = React.useState(false);
  const [pendingRemoveId, setPendingRemoveId] = React.useState<string | null>(
    null,
  );

  const pendingParticipant = React.useMemo(() => {
    if (!pendingRemoveId) return null;
    return doc.participants.find((p) => p.id === pendingRemoveId) ?? null;
  }, [doc.participants, pendingRemoveId]);

  function commit(nextParticipants: Participant[]): void {
    onDocumentChange(persistParticipants(doc, nextParticipants));
  }

  function handleParticipantAdded(participant: Participant): void {
    commit([...doc.participants, participant]);
  }

  function handleConfirmRemove(): void {
    if (!pendingRemoveId) return;
    commit(doc.participants.filter((p) => p.id !== pendingRemoveId));
    setPendingRemoveId(null);
  }

  const sessionHref = `/sessions/${encodeURIComponent(doc.id)}`;

  return (
    <>
      <Card className="min-w-0">
        <CardHeader className="gap-2">
          <CardTitle>{t("participants.sectionTitle")}</CardTitle>
          <CardDescription className="text-pretty">
            {t("participants.sectionHint")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {doc.participants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("participants.empty")}
            </p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {doc.participants.map((participant) => {
                const label = participantPrimaryLabel(participant);
                const title =
                  label.trim() || t("participant.display.unlabeled");
                const detailHref = `${sessionHref}/participants/${encodeURIComponent(participant.id)}`;
                const resultsHref = `${detailHref}/results`;

                return (
                  <li key={participant.id} className="min-w-0">
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="truncate font-medium">{title}</div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{t("participants.colStatus")}</span>
                          <Badge
                            variant={gradingStatusBadgeVariant(
                              participant.gradingStatus,
                            )}
                          >
                            {labelParticipantGradingStatus(
                              t,
                              participant.gradingStatus,
                            )}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                        <Link
                          href={detailHref}
                          className={cn(
                            buttonVariants({
                              variant: "default",
                              size: "sm",
                            }),
                            "inline-flex min-h-11 w-full items-center justify-center sm:min-h-9 sm:w-auto",
                          )}
                        >
                          {t("participants.open")}
                        </Link>
                        <Link
                          href={resultsHref}
                          className={cn(
                            buttonVariants({
                              variant: "outline",
                              size: "sm",
                            }),
                            "inline-flex min-h-11 w-full items-center justify-center sm:min-h-9 sm:w-auto",
                          )}
                        >
                          {t("participants.results")}
                        </Link>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="min-h-11 w-full gap-2 sm:min-h-9 sm:w-auto"
                          aria-label={t("participants.remove")}
                          onClick={() =>
                            setPendingRemoveId(participant.id)
                          }
                        >
                          <Trash2Icon className="size-4" aria-hidden />
                          {t("participants.remove")}
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
          <Button
            type="button"
            variant="default"
            className="min-h-11 w-full gap-2 sm:w-auto sm:min-h-9"
            onClick={() => setAddOpen(true)}
          >
            <PlusIcon className="size-4" aria-hidden />
            {t("participants.add")}
          </Button>
        </CardFooter>
      </Card>

      <Dialog
        open={pendingRemoveId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemoveId(null);
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>{t("participants.removeTitle")}</DialogTitle>
            <DialogDescription className="text-pretty">
              {t("participants.removeDescription")}
              {pendingParticipant ? (
                <span className="mt-2 block font-medium text-foreground">
                  {participantPrimaryLabel(pendingParticipant).trim() ||
                    t("participant.display.unlabeled")}
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 sm:min-h-9"
              onClick={() => setPendingRemoveId(null)}
            >
              {t("participants.removeCancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11 sm:min-h-9"
              onClick={handleConfirmRemove}
            >
              {t("participants.removeConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddParticipantDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        sessionId={doc.id}
        onParticipantAdded={handleParticipantAdded}
      />
    </>
  );
}
