"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

import { validateOpenAiApiKey } from "@/src/lib/ai";
import { messageKeyForApiKeyError } from "@/src/lib/i18n/api-key-errors";
import {
  clearOpenAiApiKey,
  getOpenAiApiKey,
  setOpenAiApiKey,
} from "@/src/lib/storage/openai-key";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";

import { useApiKey } from "@/components/providers/api-key-provider";
import { useLocale } from "@/components/providers/locale-provider";

function maskKeySuffix(key: string): string {
  if (key.length <= 8) return "••••••••";
  return `••••••••${key.slice(-4)}`;
}

export function OpenAiApiKeySettings() {
  const { t } = useLocale();
  const router = useRouter();
  const { refreshApiKey } = useApiKey();

  const [storedSnapshot, setStoredSnapshot] = React.useState<string | null>(
    null,
  );

  const [value, setValue] = React.useState("");
  const [testing, setTesting] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [removeOpen, setRemoveOpen] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | null>(null);
  const [testOk, setTestOk] = React.useState(false);

  React.useEffect(() => {
    setStoredSnapshot(getOpenAiApiKey());
  }, []);

  const effectiveKey =
    value.trim().length > 0 ? value : (storedSnapshot ?? "");

  async function handleTest(): Promise<void> {
    setErrorText(null);
    setTestOk(false);

    const result = await validateOpenAiApiKey(effectiveKey);
    if (!result.ok) {
      setErrorText(t(messageKeyForApiKeyError(result.code)));
      return;
    }

    setTestOk(true);
  }

  return (
    <>
      <Card>
        <CardHeader className="gap-2">
          <CardTitle className="font-heading text-lg">
            {t("settings.api.title")}
          </CardTitle>
          <CardDescription>{t("settings.api.hint")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Alert>
            <AlertTitle className="text-sm font-medium leading-snug">
              {t("apiKey.warning.title")}
            </AlertTitle>
            <AlertDescription className="text-sm leading-relaxed">
              {t("apiKey.warning.browser")}
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {storedSnapshot
                ? t("settings.api.stored")
                : t("settings.api.noneStored")}
            </span>
            {storedSnapshot ? (
              <Badge variant="outline">{maskKeySuffix(storedSnapshot)}</Badge>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor="settings-openai-key" className="text-sm font-medium">
              {storedSnapshot
                ? t("settings.api.newPlaceholder")
                : t("onboarding.fieldLabel")}
            </label>
            <Input
              id="settings-openai-key"
              name="settings-openai-key"
              autoComplete="off"
              spellCheck={false}
              type="password"
              value={value}
              placeholder={
                storedSnapshot
                  ? t("settings.api.newPlaceholder")
                  : t("onboarding.fieldPlaceholder")
              }
              onChange={(event) => {
                setValue(event.target.value);
                setTestOk(false);
                setErrorText(null);
              }}
              className="min-h-11 text-base md:min-h-8 md:text-sm"
            />
          </div>

          {errorText ? (
            <Alert variant="destructive">
              <AlertTitle className="sr-only">{t("apiKey.error.generic")}</AlertTitle>
              <AlertDescription>{errorText}</AlertDescription>
            </Alert>
          ) : null}

          {testOk ? (
            <Badge variant="secondary" className="w-fit">
              {t("apiKey.success.test")}
            </Badge>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant="outline"
            disabled={testing || saving}
            className="min-h-11 w-full gap-2 text-base sm:w-auto sm:min-h-9 sm:text-sm"
            onClick={async () => {
              setTesting(true);
              try {
                await handleTest();
              } finally {
                setTesting(false);
              }
            }}
          >
            {testing ? (
              <Loader2Icon className="size-4 animate-spin" aria-hidden />
            ) : null}
            {t("settings.api.retest")}
          </Button>

          <Button
            type="button"
            disabled={
              saving ||
              testing ||
              value.trim().length === 0
            }
            className="min-h-11 w-full text-base sm:w-auto sm:min-h-9 sm:text-sm"
            onClick={async () => {
              setSaving(true);
              setErrorText(null);
              setTestOk(false);
              try {
                const result = await validateOpenAiApiKey(value);
                if (!result.ok) {
                  setErrorText(t(messageKeyForApiKeyError(result.code)));
                  return;
                }
                setOpenAiApiKey(value);
                refreshApiKey();
                setStoredSnapshot(getOpenAiApiKey());
                setValue("");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? (
              <Loader2Icon className="size-4 animate-spin" aria-hidden />
            ) : null}
            {t("settings.api.save")}
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={!storedSnapshot || saving || testing}
            className="min-h-11 w-full text-base sm:w-auto sm:min-h-9 sm:text-sm"
            onClick={() => setRemoveOpen(true)}
          >
            {t("settings.api.remove")}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("settings.api.removeTitle")}</DialogTitle>
            <DialogDescription>
              {t("settings.api.removeDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 sm:min-h-9"
              onClick={() => setRemoveOpen(false)}
            >
              {t("settings.api.removeCancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-11 sm:min-h-9"
              onClick={() => {
                clearOpenAiApiKey();
                refreshApiKey();
                setStoredSnapshot(null);
                setRemoveOpen(false);
                setValue("");
                router.replace("/onboarding");
              }}
            >
              {t("settings.api.removeConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
