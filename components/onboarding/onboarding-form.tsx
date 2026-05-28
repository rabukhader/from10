"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import {
  OPENAI_COMPATIBLE_PROVIDER_PRESETS,
  providerPresetById,
  validateOpenAiApiKey,
  type OpenAiCompatibleProviderPresetId,
} from "@/src/lib/ai";
import { messageKeyForApiKeyError } from "@/src/lib/i18n/api-key-errors";
import { setOpenAiCompatibleCredentials } from "@/src/lib/storage/openai-key";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useApiKey } from "@/components/providers/api-key-provider";
import { useLocale } from "@/components/providers/locale-provider";

export function OnboardingForm() {
  const { t } = useLocale();
  const { refreshApiKey } = useApiKey();

  const [value, setValue] = React.useState("");
  const [providerPreset, setProviderPreset] =
    React.useState<OpenAiCompatibleProviderPresetId>("openai");
  const [baseUrl, setBaseUrl] = React.useState(
    providerPresetById("openai").baseUrl,
  );
  const [gradingModel, setGradingModel] = React.useState(
    providerPresetById("openai").gradingModel,
  );
  const [examExtractionModel, setExamExtractionModel] = React.useState(
    providerPresetById("openai").examExtractionModel,
  );
  const [testing, setTesting] = React.useState(false);
  const [continuing, setContinuing] = React.useState(false);
  const [errorText, setErrorText] = React.useState<string | null>(null);
  const [testOk, setTestOk] = React.useState(false);

  function resetStatus(): void {
    setTestOk(false);
    setErrorText(null);
  }

  function handleProviderPresetChange(
    nextPreset: OpenAiCompatibleProviderPresetId,
  ): void {
    setProviderPreset(nextPreset);
    resetStatus();
    if (nextPreset === "custom") return;
    const preset = providerPresetById(nextPreset);
    setBaseUrl(preset.baseUrl);
    setGradingModel(preset.gradingModel);
    setExamExtractionModel(preset.examExtractionModel);
  }

  async function runValidate(): Promise<boolean> {
    setErrorText(null);
    setTestOk(false);

    const result = await validateOpenAiApiKey(value, {
      baseUrl,
      gradingModel,
      examExtractionModel,
    });
    if (!result.ok) {
      setErrorText(t(messageKeyForApiKeyError(result.code)));
      return false;
    }

    setTestOk(true);
    return true;
  }

  return (
    <Card className="w-full max-w-2xl border-primary/15 shadow-lg shadow-primary/5 ring-1 ring-primary/10">
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
          <span className="text-sm font-medium">
            {t("settings.api.provider")}
          </span>
          <Select
            value={providerPreset}
            onValueChange={(next) =>
              handleProviderPresetChange(
                next as OpenAiCompatibleProviderPresetId,
              )
            }
          >
            <SelectTrigger
              aria-label={t("settings.api.provider")}
              className="min-h-11 w-full justify-between text-base md:min-h-8 md:text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPENAI_COMPATIBLE_PROVIDER_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.id === "openai"
                    ? t("settings.api.providerOpenAi")
                    : preset.id === "deepseek"
                      ? t("settings.api.providerDeepSeek")
                      : t("settings.api.providerCustom")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="provider-base-url" className="text-sm font-medium">
            {t("settings.api.baseUrl")}
          </label>
          <Input
            id="provider-base-url"
            value={baseUrl}
            onChange={(event) => {
              setBaseUrl(event.target.value);
              setProviderPreset("custom");
              resetStatus();
            }}
            className="min-h-11 text-base md:min-h-8 md:text-sm"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="provider-grading-model" className="text-sm font-medium">
              {t("settings.api.gradingModel")}
            </label>
            <Input
              id="provider-grading-model"
              value={gradingModel}
              onChange={(event) => {
                setGradingModel(event.target.value);
                setProviderPreset("custom");
                resetStatus();
              }}
              className="min-h-11 text-base md:min-h-8 md:text-sm"
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="provider-extraction-model"
              className="text-sm font-medium"
            >
              {t("settings.api.examExtractionModel")}
            </label>
            <Input
              id="provider-extraction-model"
              value={examExtractionModel}
              onChange={(event) => {
                setExamExtractionModel(event.target.value);
                setProviderPreset("custom");
                resetStatus();
              }}
              className="min-h-11 text-base md:min-h-8 md:text-sm"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("settings.api.compatHint")}
        </p>

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
              resetStatus();
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
              setOpenAiCompatibleCredentials({
                apiKey: value,
                baseUrl,
                gradingModel,
                examExtractionModel,
                providerPreset,
              });
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
