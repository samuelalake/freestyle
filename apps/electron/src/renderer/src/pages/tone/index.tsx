import type {
  CleanupAppAssignment,
  CleanupIntensity,
} from "@freestyle-voice/validations";
import {
  type AppMarkId,
  AppMarkStack,
} from "@renderer/components/tone-previews/app-marks";
import { CleanupPreview } from "@renderer/components/tone-previews/cleanup-preview";
import { getVisibleBuiltinRouteIds } from "@renderer/components/tone-previews/route-ownership";
import { SegmentedControl } from "@renderer/components/ui/segmented-control";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
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
              <CustomRow settings={settings} />
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
  const navigate = useNavigate();

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
        onValueChange={(value) => {
          const next = value as CleanupIntensity;
          settings.selectCleanupMode(next);
          // "Custom…" opens its own surface, the way an ellipsis option does in
          // macOS and iOS. Picking it means nothing until a prompt exists, so
          // going straight there beats landing back on a page that can't show
          // you what you just chose.
          if (next === "custom") void navigate(CUSTOM_PROMPT_PATH);
        }}
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
 * First line of a prompt, capped for the row.
 *
 * Two layers, because they catch different things. The character cap stops a
 * prompt written as one long line (the presets are ~15,000 characters with no
 * hard wraps) from going into the DOM whole, and marks the cut with an ellipsis
 * the reader can see. `truncate` on the element then handles any line still
 * wider than the row at the current window size.
 */
const ROW_SUMMARY_MAX = 140;
function summarizePrompt(prompt: string): string {
  const line =
    prompt
      .split("\n")
      .find((l) => l.trim())
      ?.trim() ?? "";
  return line.length > ROW_SUMMARY_MAX
    ? `${line.slice(0, ROW_SUMMARY_MAX).trimEnd()}…`
    : line;
}

/**
 * Custom shows a navigation row, not a preview.
 *
 * Low, Medium and High can each show a sample because we know what they do.
 * Custom runs instructions only the user writes, so any sample here would be
 * invented. Earlier drafts tried a seeded sample, a tooltip naming the preset
 * it came from, and a generic fallback line, all of them covering for a preview
 * that shouldn't exist. A row that says what's written and takes you to the
 * editor is the same pattern the four app groups use below.
 */
function CustomRow({
  settings,
}: {
  settings: ToneSettings;
}): React.JSX.Element {
  const { t } = useTranslation();
  // The *stored* prompt, not the draft — this should reflect what will actually
  // run, not what someone is part-way through typing on the other page.
  const prompt = settings.savedCleanupCustomPrompt.trim();
  const firstLine = summarizePrompt(prompt);

  return (
    <Link
      to={CUSTOM_PROMPT_PATH}
      className="hover:bg-accent/35 focus-visible:ring-ring/40 border-border/70 flex items-center justify-between gap-4 border-t px-5 py-3.5 transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
    >
      <div className="min-w-0">
        <p className="text-foreground text-[13.5px] font-medium">
          {t("tone.customPrompt.title")}
        </p>
        <p className="text-muted-foreground mt-0.5 truncate text-[12px] leading-[1.5]">
          {prompt ? firstLine : t("tone.customPrompt.rowEmpty")}
        </p>
      </div>
      <ChevronRight
        className="text-muted-foreground size-4 shrink-0"
        aria-hidden="true"
      />
    </Link>
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
