"use client";

import { startTransition, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, Save, Share2 } from "lucide-react";

import { MoodSelector } from "@/components/editor/MoodSelector";
import { RemixControls } from "@/components/editor/RemixControls";
import { ShareModal } from "@/components/editor/ShareModal";
import { SoundscapeCanvas } from "@/components/editor/SoundscapeCanvas";
import { createExport, getExportJob, saveScene } from "@/lib/api/client";
import { useAudioEngine } from "@/lib/audio/use-audio-engine";
import { MOOD_CONFIG } from "@/lib/scene/moods";
import type { ExportDuration, MoodId } from "@/lib/scene/types";
import { buildSceneFromBlend, formatMoodBlend } from "@/lib/scene/utils";
import { usePerformanceTier } from "@/lib/hooks/use-performance-tier";
import { useMuseWaveStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const MuseWaveEditor = () => {
  const scene = useMuseWaveStore((state) => state.scene);
  const metrics = useMuseWaveStore((state) => state.metrics);
  const lastSaved = useMuseWaveStore((state) => state.lastSaved);
  const currentExport = useMuseWaveStore((state) => state.currentExport);
  const playbackStatus = useMuseWaveStore((state) => state.playbackStatus);
  const setScene = useMuseWaveStore((state) => state.setScene);
  const resetScene = useMuseWaveStore((state) => state.resetScene);
  const setMoodWeight = useMuseWaveStore((state) => state.setMoodWeight);
  const setControl = useMuseWaveStore((state) => state.setControl);
  const toggleLayer = useMuseWaveStore((state) => state.toggleLayer);
  const patchLayer = useMuseWaveStore((state) => state.patchLayer);
  const setSaved = useMuseWaveStore((state) => state.setSaved);
  const setExportJob = useMuseWaveStore((state) => state.setExportJob);
  const { start, toggle, error } = useAudioEngine(scene);
  const { lowPower, reducedMotion } = usePerformanceTier();
  const [previewMood, setPreviewMood] = useState<MoodId | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [busyLabel, setBusyLabel] = useState<string>();
  const [message, setMessage] = useState<string>();

  const previewScene = useMemo(() => {
    if (!previewMood || scene.moodBlend.some((entry) => entry.mood === previewMood)) {
      return scene;
    }

    return buildSceneFromBlend(
      [...scene.moodBlend.map((entry) => ({ ...entry, weight: entry.weight * 0.8 })), { mood: previewMood, weight: 0.2 }],
      scene.seed + 11
    );
  }, [previewMood, scene]);

  const handleSave = async (openModal = false) => {
    setBusyLabel("Saving scene...");
    setMessage(undefined);

    try {
      const response = await saveScene({
        slug: lastSaved?.slug ?? scene.slug ?? undefined,
        scene
      });

      startTransition(() => {
        setScene(response.scene);
        setSaved(response);
      });

      if (openModal) {
        setShareOpen(true);
      }

      setMessage("Scene synced. Your public MuseWave page is ready.");
      return response;
    } catch (nextError) {
      setMessage(nextError instanceof Error ? nextError.message : "Unable to save scene.");
      return undefined;
    } finally {
      setBusyLabel(undefined);
    }
  };

  const handleExport = async (duration: ExportDuration) => {
    setBusyLabel(`Queueing ${duration}s export...`);
    setMessage(undefined);

    try {
      const saved = lastSaved ?? (await handleSave(false));

      if (!saved) {
        return;
      }

      const job = await createExport(saved.slug, duration, scene);
      setExportJob(job);
      setMessage("Export queued. The worker will publish your WAV shortly.");

      const poll = window.setInterval(async () => {
        const latest = await getExportJob(job.id);
        setExportJob(latest);

        if (latest.status === "completed" || latest.status === "failed") {
          window.clearInterval(poll);
          setBusyLabel(undefined);
          setMessage(
            latest.status === "completed"
              ? "Export finished. Your WAV is ready for download."
              : latest.errorMessage ?? "Export failed."
          );
        }
      }, 3000);
    } catch (nextError) {
      setMessage(nextError instanceof Error ? nextError.message : "Unable to queue export.");
    } finally {
      setBusyLabel(undefined);
    }
  };

  return (
    <div className="space-y-6" id="studio">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[36px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-cyan/75">Live studio</p>
              <h2 className="mt-2 font-display text-3xl text-white">{scene.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{scene.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (playbackStatus === "idle" || playbackStatus === "paused") {
                    void start();
                    return;
                  }

                  void toggle();
                }}
                className="rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-cyan transition hover:border-cyan/60"
              >
                {playbackStatus === "playing" ? (
                  <Pause className="mr-2 inline h-4 w-4" />
                ) : (
                  <Play className="mr-2 inline h-4 w-4" />
                )}
                {playbackStatus === "playing" ? "Pause" : "Start audio"}
              </button>
              <button
                type="button"
                onClick={() => void handleSave(false)}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-white/25 hover:text-white"
              >
                <Save className="mr-2 inline h-4 w-4" />
                Save
              </button>
              <button
                type="button"
                onClick={() => void handleSave(true)}
                className="rounded-full border border-coral/30 bg-coral/10 px-4 py-2 text-sm text-coral transition hover:border-coral/60"
              >
                <Share2 className="mr-2 inline h-4 w-4" />
                Share
              </button>
              <button
                type="button"
                onClick={resetScene}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/55 transition hover:border-white/20 hover:text-white"
              >
                <RotateCcw className="mr-2 inline h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          <SoundscapeCanvas
            scene={previewScene}
            metrics={metrics}
            lowPower={lowPower}
            reducedMotion={reducedMotion}
            previewLabel={previewMood ? MOOD_CONFIG[previewMood].label : null}
          />
        </div>

        <aside className="space-y-4">
          <div className="rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.32em] text-mint/80">Current blend</p>
            <h3 className="mt-3 font-display text-2xl text-white">{formatMoodBlend(scene.moodBlend)}</h3>
            <div className="mt-5 grid gap-3 text-sm text-white/65">
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">Harmony</p>
                <p className="mt-2 text-white">
                  {scene.key} {scene.scale} / {scene.tempo} BPM
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">Device profile</p>
                <p className="mt-2 text-white">
                  {reducedMotion ? "Reduced motion" : lowPower ? "Low-power mode" : "Full visual stack"}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">Playback</p>
                <p className="mt-2 text-white">
                  {playbackStatus === "playing" ? "Live" : "Armed"} / energy {Math.round(metrics.energy * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl" id="share">
            <p className="text-xs uppercase tracking-[0.32em] text-coral/80">Publishing</p>
            <h3 className="mt-3 font-display text-2xl text-white">Share-ready output</h3>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Every saved composition gets a public URL, embed player, and OG artwork route. Export jobs add downloadable audio.
            </p>

            {lastSaved ? (
              <div className="mt-4 space-y-2 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                <p className="truncate">Public: {lastSaved.shareUrl}</p>
                <p className="truncate">Embed: {lastSaved.embedUrl}</p>
                                <a
                  href={lastSaved.shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-cyan transition hover:border-cyan/60"
                >
                  Open player
                </a>
              </div>
            ) : null}

            {(busyLabel || message || error || currentExport) ? (
              <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                {busyLabel ? <p className="text-cyan">{busyLabel}</p> : null}
                {message ? <p className="mt-1">{message}</p> : null}
                {error ? <p className="mt-1 text-coral">{error}</p> : null}
                {currentExport ? (
                  <p className={cn("mt-1", currentExport.status === "completed" ? "text-mint" : "text-white/70")}>
                    Export {currentExport.status}
                    {currentExport.audioUrl ? ` / ${currentExport.audioUrl}` : ""}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <MoodSelector
          scene={scene}
          previewMood={previewMood}
          onPreviewMood={setPreviewMood}
          onWeightChange={setMoodWeight}
        />
        <RemixControls
          scene={scene}
          busy={Boolean(busyLabel)}
          exportStatus={currentExport ? `${currentExport.status}${currentExport.audioUrl ? ` / ${currentExport.audioUrl}` : ""}` : undefined}
          onControlChange={setControl}
          onToggleLayer={toggleLayer}
          onPatchLayer={patchLayer}
          onExport={(duration) => void handleExport(duration)}
        />
      </div>

      <ShareModal open={shareOpen} response={lastSaved} onClose={() => setShareOpen(false)} />
    </div>
  );
};




