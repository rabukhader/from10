"use client";

import * as React from "react";

import type { Participant } from "@/src/domain";
import {
  createDraftParticipant,
  validateParticipantIdentity,
} from "@/src/lib/participants";
import type { MessageKey } from "@/src/lib/i18n/messages";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useLocale } from "@/components/providers/locale-provider";

import { cn } from "@/lib/utils";

export function AddParticipantDialog({
  open,
  onOpenChange,
  sessionId,
  onParticipantAdded,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  onParticipantAdded: (participant: Participant) => void;
}>) {
  const { t } = useLocale();
  const [name, setName] = React.useState("");
  const [universityId, setUniversityId] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [section, setSection] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [errorKey, setErrorKey] = React.useState<MessageKey | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setName("");
    setUniversityId("");
    setEmail("");
    setSection("");
    setNotes("");
    setErrorKey(null);
  }, [open]);

  const labelClass = "text-sm font-medium leading-none";
  const controlClass = "min-h-11 text-base md:min-h-8 md:text-sm";

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    const draft = createDraftParticipant(sessionId, {
      name,
      universityId,
      email,
      section,
      notes,
    });
    const validation = validateParticipantIdentity(draft);
    if (validation) {
      setErrorKey(validation);
      return;
    }
    onParticipantAdded(draft);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("participant.dialog.title")}</DialogTitle>
            <DialogDescription className="text-pretty">
              {t("participant.dialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {errorKey ? (
              <Alert variant="destructive">
                <AlertDescription>{t(errorKey)}</AlertDescription>
              </Alert>
            ) : null}

            <div className="grid gap-2">
              <label htmlFor="ap-name" className={labelClass}>
                {t("participant.field.name")}
              </label>
              <Input
                id="ap-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                className={controlClass}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="ap-university-id" className={labelClass}>
                {t("participant.field.universityId")}
              </label>
              <Input
                id="ap-university-id"
                value={universityId}
                onChange={(event) => setUniversityId(event.target.value)}
                autoComplete="username"
                className={controlClass}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="ap-email" className={labelClass}>
                {t("participant.field.email")}
              </label>
              <Input
                id="ap-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className={controlClass}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="ap-section" className={labelClass}>
                {t("participant.field.section")}
              </label>
              <Input
                id="ap-section"
                value={section}
                onChange={(event) => setSection(event.target.value)}
                className={controlClass}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="ap-notes" className={labelClass}>
                {t("participant.field.notes")}
              </label>
              <Textarea
                id="ap-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className={cn(controlClass, "min-h-24")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 sm:min-h-9"
              onClick={() => onOpenChange(false)}
            >
              {t("participant.dialog.cancel")}
            </Button>
            <Button type="submit" className="min-h-11 sm:min-h-9">
              {t("participant.dialog.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
