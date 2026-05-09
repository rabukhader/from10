"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { validateOpenAiApiKey } from "@/src/lib/ai";
import { messageKeyForApiKeyError } from "@/src/lib/i18n/api-key-errors";
import { setOpenAiApiKey } from "@/src/lib/storage/openai-key";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Input } from "@/components/ui/input";

import { useApiKey } from "@/components/providers/api-key-provider";
import { useLocale } from "@/components/providers/locale-provider";

export function OnboardingForm() {
  const { t } = useLocale();
  const { refreshApiKey } = useApiKey();

  const [value, setValue] = React.useState("");
  const [testing, setTesting] = React.useState(false);
  const [continuing, setContinuing] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | null>(null);
  const [testOk, setTestOk] = React.useState(false);

  async function runValidate(): Promise<boolean> {
    setErrorText(null);
    setTestOk(false);

    const result = await validateOpenAiApiKey(value);
    if (!result.ok) {
      setErrorText(t(messageKeyForApiKeyError(result.code)));
      return false;
    }

    setTestOk(true);
    return true;
  }

  return (
    <Card className="w-full max-w-md border-primary/15 shadow-lg shadow-primary/5 ring-1 ring-primary/10">
      <CardHeader className="gap-2">
        <CardTitle className="font-heading text-xl sm:text-2xl">
          {t("onboarding.title")}
        </CardTitle>
        <CardDescription>{t("onboarding.description")}</CardDescription>
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

        <div className="grid gap-2">
          <label htmlFor="openai-key" className="text-sm font-medium">
            {t("onboarding.fieldLabel")}
          </label>
          <Input
            id="openai-key"
            name="openai-key"
            autoComplete="off"
            spellCheck={false}
            type="password"
            value={value}
            placeholder={t("onboarding.fieldPlaceholder")}
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
          disabled={testing || continuing}
          className="min-h-11 w-full gap-2 text-base sm:w-auto sm:min-h-9 sm:text-sm"
          onClick={async () => {
            setTesting(true);
            try {
              await runValidate();
            } finally {
              setTesting(false);
            }
          }}
        >
          {testing ? (
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
          ) : null}
          {t("onboarding.test")}
        </Button>
        <Button
          type="button"
          disabled={testing || continuing}
          className="min-h-11 w-full text-base sm:w-auto sm:min-h-9 sm:text-sm"
          onClick={async () => {
            setContinuing(true);
            try {
              const ok = await runValidate();
              if (!ok) return;
              setOpenAiApiKey(value);
              refreshApiKey();
            } finally {
              setContinuing(false);
            }
          }}
        >
          {continuing ? (
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
          ) : null}
          {t("onboarding.continue")}
        </Button>
      </CardFooter>
    </Card>
  );
}
