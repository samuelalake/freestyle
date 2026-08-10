import { CLEANUP_CUSTOM_PROMPT_MAX } from "@freestyle-voice/validations";
import { Button } from "@renderer/components/ui/button";
import { Textarea } from "@renderer/components/ui/textarea";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { Eyebrow, PageHeader, PageShell } from "../models/page-chrome";
import { ToneStateBanner } from "./banners";
import { useToneSettings } from "./use-tone-settings";

/**
 * The custom cleanup prompt, on its own page.
 *
 * This is a 160px monospace editor plus a preset dump — on the Tone index it
 * outweighed every other control on the page and pushed the four destination
 * rows below the fold, for a setting most people never touch. The index keeps
 * a preview row that links here.
 */
export default function ToneCustomPromptPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        <Link
          to="/settings/tone"
          className="text-muted-foreground hover:text-foreground -ml-1 mb-4 inline-flex items-center gap-1 text-[12px] transition-colors"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          {t("tone.customPrompt.backToTone")}
        </Link>

        <PageHeader
          title={t("tone.customPrompt.title")}
          subtitle={t("tone.customPrompt.subtitle")}
        />

        <ToneStateBanner settings={settings} />

        <section className="mt-7 mb-2">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <Eyebrow text={t("models.cleanup.promptLabel")} mono />
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() => {
                // Going back to a preset makes this page moot — return to the
                // index rather than leaving them editing a prompt nothing runs.
                settings.resetToPresetMode();
                void navigate("/settings/tone");
              }}
            >
              {t("models.cleanup.resetToPresets")}
            </Button>
          </div>
          <Textarea
            value={settings.cleanupCustomPrompt}
            maxLength={CLEANUP_CUSTOM_PROMPT_MAX}
            onChange={(event) =>
              settings.setCleanupCustomPrompt(event.target.value)
            }
            spellCheck={false}
            placeholder={t("tone.customPrompt.placeholder")}
            className="mono min-h-[320px] resize-y text-[12px] leading-[1.65]"
            aria-label={t("models.cleanup.promptLabel")}
          />
          <div className="text-muted-foreground mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <span>
              {settings.cleanupCustomPrompt.length} /{" "}
              {CLEANUP_CUSTOM_PROMPT_MAX}
            </span>
            <Button
              variant="ink"
              size="sm"
              onClick={() => void settings.saveCleanupCustomPrompt()}
              disabled={
                settings.savingCustomPrompt || !settings.customPromptDirty
              }
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
        </section>
      </div>
    </PageShell>
  );
}
