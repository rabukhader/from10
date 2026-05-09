"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2Icon, Trash2Icon } from "lucide-react";

import { appConfig } from "@/src/config";
import type { GradingSessionDocument } from "@/src/domain";
import {
  deleteSessionAndFiles,
  loadSession,
  loadSessionsIndex,
} from "@/src/lib/storage/session-repository";

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

function countGradedParticipants(doc: GradingSessionDocument): number {
  return doc.participants.filter((p) => p.gradingStatus === "completed").length;
}

export function DashboardHome() {
  const { t } = useLocale();
  const [pendingDelete, setPendingDelete] = React.useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);

  const [metrics, setMetrics] = React.useState<{
    sessionCount: number;
    gradedTotal: number;
    recent: { id: string; title: string; updatedAt: string }[];
    lastActiveSessionId?: string;
    lastActiveExists: boolean;
  } | null>(null);

  const reloadMetrics = React.useCallback(() => {
    const index = loadSessionsIndex();
    let gradedTotal = 0;
    const docs: GradingSessionDocument[] = [];

    for (const id of index.sessionIds) {
      const doc = loadSession(id);
      if (!doc) continue;
      docs.push(doc);
      gradedTotal += countGradedParticipants(doc);
    }

    docs.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    const recent = docs
      .slice(0, appConfig.ui.dashboardRecentSessionsLimit)
      .map((d) => ({
        id: d.id,
        title:
          d.exam.examTitle.trim() ||
          d.exam.courseName.trim() ||
          t("dashboard.recent.untitled"),
        updatedAt: d.updatedAt,
      }));

    const lastId = index.lastActiveSessionId;
    const lastActiveExists = Boolean(lastId && loadSession(lastId));

    setMetrics({
      sessionCount: docs.length,
      gradedTotal,
      recent,
      lastActiveSessionId: lastId,
      lastActiveExists,
    });
  }, [t]);

  React.useEffect(() => {
    reloadMetrics();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        reloadMetrics();
      }
    };

    window.addEventListener("focus", reloadMetrics);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("focus", reloadMetrics);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [reloadMetrics]);

  const sessionCount = metrics?.sessionCount ?? 0;
  const gradedTotal = metrics?.gradedTotal ?? 0;

  async function confirmDeleteSession(): Promise<void> {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    try {
      await deleteSessionAndFiles(pendingDelete.id);
      setPendingDelete(null);
      reloadMetrics();
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-w-0 max-w-full flex-col gap-6 md:max-w-5xl">
      <div className="min-w-0">
        <h1 className="break-words font-heading text-2xl font-semibold tracking-tight lg:text-3xl">
          {t("dashboard.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
          {t("dashboard.subtitle")}
        </p>
      </div>

      <div
        className="grid min-w-0 gap-4 sm:grid-cols-2"
        aria-busy={!metrics}
      >
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>{t("dashboard.metric.sessions")}</CardTitle>
            <CardDescription>{t("dashboard.metric.sessionsDetail")}</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">
            {!metrics ? (
              <span className="text-muted-foreground">{t("common.loading")}</span>
            ) : (
              sessionCount
            )}
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>{t("dashboard.metric.graded")}</CardTitle>
            <CardDescription>{t("dashboard.metric.gradedDetail")}</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tabular-nums">
            {!metrics ? (
              <span className="text-muted-foreground">{t("common.loading")}</span>
            ) : (
              gradedTotal
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>{t("nav.sessions")}</CardTitle>
          <CardDescription>{t("dashboard.quick.newSession")}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2 border-t-0 pt-0">
          <Link
            href="/sessions/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "min-h-11 w-full justify-center sm:w-auto sm:min-h-9",
            )}
          >
            {t("dashboard.quick.newSession")}
          </Link>
          {metrics?.lastActiveSessionId && metrics.lastActiveExists ? (
            <Link
              href={`/sessions/${metrics.lastActiveSessionId}`}
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "min-h-11 w-full justify-center sm:w-auto sm:min-h-9",
              )}
            >
              {t("dashboard.quick.continue")}
            </Link>
          ) : (
            <span
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center opacity-50 sm:w-auto sm:min-h-9",
              )}
              aria-disabled
            >
              {t("dashboard.quick.continueNone")}
            </span>
          )}
        </CardFooter>
      </Card>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>{t("dashboard.recent.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!metrics ? (
            <p className="text-sm text-muted-foreground" role="status">
              {t("common.loading")}
            </p>
          ) : metrics.recent.length === 0 ? (
            <p className="text-pretty text-sm text-muted-foreground">
              {t("dashboard.recent.empty")}
            </p>
          ) : (
            <div className="-mx-1 min-w-0 overflow-x-auto rounded-lg border sm:mx-0">
              <ul className="min-w-0 divide-y">
                {metrics.recent.map((row) => (
                  <li
                    key={row.id}
                    className="flex min-w-0 items-stretch divide-x"
                  >
                    <Link
                      href={`/sessions/${row.id}`}
                      className="flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-3 text-sm hover:bg-muted/60"
                    >
                      <span
                        className="block truncate font-medium"
                        title={row.title}
                      >
                        {row.title}
                      </span>
                      <span className="text-xs break-all text-muted-foreground">
                        {new Date(row.updatedAt).toLocaleString()}
                      </span>
                    </Link>
                    <div className="flex shrink-0 items-center px-1 sm:px-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11 shrink-0 text-muted-foreground hover:text-destructive sm:size-10"
                        aria-label={t("dashboard.recent.deleteAria")}
                        onClick={() =>
                          setPendingDelete({ id: row.id, title: row.title })
                        }
                      >
                        <Trash2Icon className="size-4" aria-hidden />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteBusy) setPendingDelete(null);
        }}
      >
        <DialogContent className="max-w-md" showCloseButton={!deleteBusy}>
          <DialogHeader>
            <DialogTitle>{t("dashboard.recent.deleteTitle")}</DialogTitle>
            <DialogDescription className="text-pretty">
              {t("dashboard.recent.deleteDescription")}
              {pendingDelete?.title ? (
                <span className="mt-3 block font-medium text-foreground">
                  {pendingDelete.title}
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 sm:min-h-9"
              disabled={deleteBusy}
              onClick={() => setPendingDelete(null)}
            >
              {t("dashboard.recent.deleteCancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11 gap-2 sm:min-h-9"
              disabled={deleteBusy}
              aria-busy={deleteBusy}
              onClick={() => void confirmDeleteSession()}
            >
              {deleteBusy ? (
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
              ) : null}
              {t("dashboard.recent.deleteConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
