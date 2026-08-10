import {
  CLEANUP_CUSTOM_PROMPT_MAX,
  type CleanupIntensity,
} from "@freestyle-voice/validations";
import {
  type AppMarkId,
  AppMarkRow,
  getAppMarkLabel,
} from "@renderer/components/tone-previews/app-marks";
import { CleanupPreview } from "@renderer/components/tone-previews/cleanup-preview";
import { getVisibleBuiltinRouteIds } from "@renderer/components/tone-previews/route-ownership";
import { Button } from "@renderer/components/ui/button";
import { SegmentedControl } from "@renderer/components/ui/segmented-control";
import { Textarea } from "@renderer/components/ui/textarea";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Eyebrow, PageHeader, PageShell } from "../models/page-chrome";
import { ToneStateBanner } from "./banners";
import {
  CLEANUP_OPTIONS,
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
              <CustomPromptRow settings={settings} />
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

function CustomPromptRow({
  settings,
}: {
  settings: ToneSettings;
}): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="border-border/70 border-t px-5 py-4">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <Eyebrow text={t("models.cleanup.promptLabel")} />
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0"
          onClick={settings.resetToPresetMode}
        >
          {t("models.cleanup.resetToPresets")}
        </Button>
      </div>
      <p className="text-muted-foreground mb-3 text-[12.5px] leading-[1.55]">
        {t("models.cleanup.presetHint")}
      </p>
      <Textarea
        value={settings.cleanupCustomPrompt}
        maxLength={CLEANUP_CUSTOM_PROMPT_MAX}
        onChange={(event) =>
          settings.setCleanupCustomPrompt(event.target.value)
        }
        spellCheck={false}
        className="mono min-h-[160px] resize-y text-[12px] leading-[1.65]"
        aria-label={t("models.cleanup.promptLabel")}
      />
      <div className="text-muted-foreground mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px]">
        <span>{t("models.cleanup.customHint")}</span>
        <Button
          variant="ink"
          size="sm"
          onClick={() => void settings.saveCleanupCustomPrompt()}
          disabled={settings.savingCustomPrompt || !settings.customPromptDirty}
        >
          {settings.savingCustomPrompt ? (
            <>
              <Loader2 className="animate-spin" />
              {t("models.cleanup.saving")}
            </>
          ) : settings.customPromptDirty ? (
            t("models.cleanup.save")
          ) : (
            <>
              <Check />
              {t("models.cleanup.saved")}
            </>
          )}
        </Button>
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
): { toneLabel: string; isOff: boolean; appIds: AppMarkId[]; apps: string[] } {
  const { t } = useTranslation();

  const value = destinationValue(meta, settings);
  const active =
    meta.options.find((option) => option.value === value) ?? meta.options[0]!;

  const appIds = meta.canManageRoutes
    ? getVisibleBuiltinRouteIds(
        meta.destination as "personal" | "work" | "email",
        settings.assignments,
      )
    : [];

  const apps = [
    ...appIds.map(getAppMarkLabel),
    ...settings.assignments
      .filter((a) => a.destination === meta.destination)
      .map((a) => a.label),
  ];

  return {
    toneLabel: t(active.titleKey),
    isOff: active.value === "off",
    appIds,
    apps,
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
  const { toneLabel, isOff, appIds, apps } = useDestinationSummary(
    meta,
    settings,
  );

  // Named apps when we have them; otherwise say what the fallback catches.
  const appsSummary = meta.canManageRoutes
    ? apps.join(", ")
    : t("tone.apps.anyUnlisted");

  return (
    <Link
      to={destinationPath(meta.slug)}
      className={
        "hover:bg-accent/35 focus-visible:ring-ring/40 flex items-center justify-between gap-4 px-5 py-3.5 transition-colors focus-visible:ring-[3px] focus-visible:outline-none" +
        (first ? "" : " border-border/70 border-t")
      }
    >
      <div className="min-w-0">
        <p className="text-foreground text-[13.5px] font-medium">
          {t(`tone.${meta.group}.rowTitle`)}
        </p>
        <p className="text-muted-foreground mt-0.5 truncate text-[12px] leading-[1.5]">
          <span className={isOff ? "italic" : "text-foreground font-medium"}>
            {t("tone.row.sounds", { tone: toneLabel })}
          </span>
          {appsSummary ? ` · ${appsSummary}` : null}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {appIds.length > 0 ? (
          <AppMarkRow ids={appIds} size={20} className="hidden sm:block" />
        ) : null}
        <ChevronRight
          className="text-muted-foreground size-4"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
