import {
  CLEANUP_PRESET_PROMPTS,
  type CleanupAppAssignment,
  type CleanupIntensity,
} from "@freestyle-voice/validations";
import {
  type AppMarkId,
  AppMarkStack,
} from "@renderer/components/tone-previews/app-marks";
import { CleanupPreview } from "@renderer/components/tone-previews/cleanup-preview";
import { getVisibleBuiltinRouteIds } from "@renderer/components/tone-previews/route-ownership";
import { Button } from "@renderer/components/ui/button";
import { SegmentedControl } from "@renderer/components/ui/segmented-control";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@renderer/components/ui/tooltip";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Eyebrow, PageHeader, PageShell } from "../models/page-chrome";
import { ToneStateBanner } from "./banners";
import {
  CLEANUP_OPTIONS,
  CUSTOM_PROMPT_PATH,
  DESTINATIONS,
  type DestinationMeta,
  destinationPath,
} from "./options";
import { type ToneSettings, useToneSettings } from "./use-tone-settings";

export default function TonePage(): React.JSX.Element {
  const { t } = useTranslation();
  const settings = useToneSettings();

  if (settings.loading) {
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-[1060px]">
          <div className="flex items-center justify-center py-24">
            <p className="text-muted-foreground text-sm">{t("tone.loading")}</p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-[1060px]">
        <PageHeader title={t("tone.title")} subtitle={t("tone.subtitle")} />

        <ToneStateBanner settings={settings} />

        <section className="mt-7">
          <Eyebrow text={t("tone.sections.howMuchToFix")} mono />
          <div className="border-border bg-card mt-3 rounded-[14px] border">
            <StrengthRow settings={settings} />
            {settings.cleanupIntensity === "custom" ? (
              <CustomPreviewRow settings={settings} />
            ) : (
              <StrengthPreviewRow value={settings.cleanupIntensity} />
            )}
          </div>
        </section>

        <section className="mt-7">
          <Eyebrow text={t("tone.sections.howYouSound")} mono />
          <div className="border-border bg-card mt-3 rounded-[14px] border">
            {DESTINATIONS.map((meta, index) => (
              <DestinationRow
                key={meta.slug}
                meta={meta}
                settings={settings}
                first={index === 0}
              />
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

// ---------------------------------------------------------------------------
// How much to fix — the one setting that applies everywhere, editable in place
// ---------------------------------------------------------------------------

function StrengthRow({
  settings,
}: {
  settings: ToneSettings;
}): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="text-foreground text-[13.5px] font-medium">
          {t("tone.cleanup.strengthLabel")}
        </p>
        <p className="text-muted-foreground mt-0.5 text-[12px] leading-[1.5]">
          {t("tone.strength.desc")}
        </p>
      </div>
      <SegmentedControl
        size="sm"
        value={settings.cleanupIntensity}
        onValueChange={(value) =>
          settings.selectCleanupMode(value as CleanupIntensity)
        }
        options={CLEANUP_OPTIONS.map((option) => ({
          value: option.value,
          label: t(option.titleKey),
        }))}
      />
    </div>
  );
}

function StrengthPreviewRow({
  value,
}: {
  value: CleanupIntensity;
}): React.JSX.Element {
  const { t } = useTranslation();
  const active =
    CLEANUP_OPTIONS.find((option) => option.value === value) ??
    CLEANUP_OPTIONS[0]!;

  return (
    <div className="border-border/70 grid gap-5 border-t px-5 py-4 min-[720px]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] min-[720px]:gap-8">
      <div>
        <Eyebrow text={t("tone.cleanup.preview.rawLabel")} />
        <p className="text-muted-foreground mt-2 text-[13px] leading-[1.6]">
          {t("tone.cleanup.preview.rawSample")}
        </p>
      </div>
      <div className="min-[720px]:border-border/60 min-[720px]:border-l min-[720px]:pl-8">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Eyebrow text={t("tone.cleanup.preview.resultLabel")} accent />
          <Eyebrow text={t(active.titleKey)} />
        </div>
        <CleanupPreview result={t(active.sampleKey)} selected={false} />
      </div>
    </div>
  );
}

/**
 * Which preset a custom prompt is still identical to, if any.
 *
 * Selecting Custom seeds the prompt from the preset you were on, so until it's
 * edited we know exactly what it does and can show that preset's sample. Once
 * it diverges we can't preview it without running the model, and say so.
 */
function presetBehind(prompt: string): "low" | "medium" | "high" | null {
  for (const key of ["low", "medium", "high"] as const) {
    if (CLEANUP_PRESET_PROMPTS[key].trim() === prompt) return key;
  }
  return null;
}

/**
 * Custom keeps the presets' preview shape: "What lands" shows a *result*, not
 * the instruction that produced it. The prompt itself lives on its own page,
 * one click away via Edit.
 */
function CustomPreviewRow({
  settings,
}: {
  settings: ToneSettings;
}): React.JSX.Element {
  const { t } = useTranslation();
  // The *stored* prompt, not the draft — the index should reflect what will
  // actually run, not what someone is part-way through typing on another page.
  const prompt = settings.savedCleanupCustomPrompt.trim();
  const seededFrom = presetBehind(prompt);
  const sample = seededFrom
    ? t(`tone.cleanup.cards.${seededFrom}.sample`)
    : t("tone.cleanup.cards.custom.sample");
  const note = seededFrom
    ? t("tone.customPrompt.previewNote", {
        preset: t(`tone.cleanup.cards.${seededFrom}.title`),
      })
    : t("tone.customPrompt.previewEdited");

  return (
    <div className="border-border/70 grid gap-5 border-t px-5 py-4 min-[720px]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] min-[720px]:gap-8">
      <div>
        <Eyebrow text={t("tone.cleanup.preview.rawLabel")} />
        <p className="text-muted-foreground mt-2 text-[13px] leading-[1.6]">
          {t("tone.cleanup.preview.rawSample")}
        </p>
      </div>
      <div className="min-[720px]:border-border/60 min-[720px]:border-l min-[720px]:pl-8">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Eyebrow text={t("tone.cleanup.preview.resultLabel")} accent />
          <div className="flex items-center gap-2">
            <Eyebrow text={t("tone.cleanup.cards.custom.title")} />
            {prompt ? (
              // The tooltip is what makes the preview honest: it says which
              // preset the sample belongs to (or that an edited prompt can't be
              // previewed) and sends you to the editor to change it.
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                  >
                    <Link to={CUSTOM_PROMPT_PATH}>
                      {t("tone.customPrompt.edit")}
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[260px]">
                  {note}
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        </div>
        {prompt ? (
          <CleanupPreview result={sample} selected={false} />
        ) : (
          <div className="border-border/70 rounded-[10px] border border-dashed px-3.5 py-3.5">
            <p className="text-foreground text-[12.5px] font-medium">
              {t("tone.customPrompt.emptyTitle")}
            </p>
            <p className="text-muted-foreground mt-1 text-[11.5px] leading-[1.55]">
              {t("tone.customPrompt.emptyDesc")}
            </p>
            <Button asChild variant="ink" size="sm" className="mt-3">
              <Link to={CUSTOM_PROMPT_PATH}>
                {t("tone.customPrompt.emptyCta")}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// How you sound — one row per destination, each a link to its own page
// ---------------------------------------------------------------------------

/** Current value + routed apps for a destination, as the row subtitle. */
export function useDestinationSummary(
  meta: DestinationMeta,
  settings: ToneSettings,
): {
  toneLabel: string;
  isOff: boolean;
  appIds: AppMarkId[];
  assignments: CleanupAppAssignment[];
} {
  const { t } = useTranslation();

  const value = destinationValue(meta, settings);
  const active =
    meta.options.find((option) => option.value === value) ?? meta.options[0]!;

  // Which built-ins still belong here, after everything the user has moved.
  const appIds = meta.canManageRoutes
    ? getVisibleBuiltinRouteIds(
        meta.destination as "personal" | "work" | "email",
        settings.assignments,
      )
    : [];

  return {
    toneLabel: t(active.titleKey),
    isOff: active.value === "off",
    appIds,
    assignments: settings.assignments.filter(
      (a) => a.destination === meta.destination,
    ),
  };
}

export function destinationValue(
  meta: DestinationMeta,
  settings: ToneSettings,
): string {
  switch (meta.destination) {
    case "personal":
      return settings.personalTone;
    case "work":
      return settings.workTone;
    case "email":
      return settings.emailTone;
    default:
      return settings.overallTone;
  }
}

function DestinationRow({
  meta,
  settings,
  first,
}: {
  meta: DestinationMeta;
  settings: ToneSettings;
  first: boolean;
}): React.JSX.Element {
  const { t } = useTranslation();
  const { toneLabel, isOff, appIds, assignments } = useDestinationSummary(
    meta,
    settings,
  );

  return (
    <Link
      to={destinationPath(meta.slug)}
      className={
        "hover:bg-accent/35 focus-visible:ring-ring/40 flex items-center justify-between gap-4 px-5 py-3 transition-colors focus-visible:ring-[3px] focus-visible:outline-none" +
        (first ? "" : " border-border/70 border-t")
      }
    >
      <div className="min-w-0">
        <p className="text-foreground text-[13.5px] font-medium">
          {t(`tone.${meta.group}.rowTitle`)}
        </p>
        {meta.canManageRoutes ? (
          <AppMarkStack
            ids={appIds}
            assignments={assignments}
            size={24}
            dimmed={isOff}
            className="mt-1.5"
          />
        ) : (
          <p className="text-muted-foreground mt-1 text-[12px] leading-[1.5]">
            {t("tone.apps.anyUnlisted")}
          </p>
        )}
      </div>
      {/* The value is the answer to "what does this row do" — it belongs where
          the eye lands on a settings row, not buried in a prose subtitle. */}
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={
            isOff
              ? "text-muted-foreground text-[13px]"
              : "text-foreground text-[13px] font-medium"
          }
        >
          {toneLabel}
        </span>
        <ChevronRight
          className="text-muted-foreground size-4"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
