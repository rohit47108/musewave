"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Pause, Play, Share2 } from "lucide-react";

import { SoundscapeCanvas } from "@/components/editor/SoundscapeCanvas";
import { useAudioEngine } from "@/lib/audio/use-audio-engine";
import { usePerformanceTier } from "@/lib/hooks/use-performance-tier";
import type { ShareSceneResponse } from "@/lib/scene/types";
import { useMuseWaveStore } from "@/lib/store";
import { copyToClipboard } from "@/lib/utils";

interface PublicPlayerProps {
  initialScene: ShareSceneResponse;
}

export const PublicPlayer = ({ initialScene }: PublicPlayerProps) => {
  const setScene = useMuseWaveStore((state) => state.setScene);
  const setSaved = useMuseWaveStore((state) => state.setSaved);
  const scene = useMuseWaveStore((state) => state.scene);
  const metrics = useMuseWaveStore((state) => state.metrics);
  const playbackStatus = useMuseWaveStore((state) => state.playbackStatus);
  const { start, toggle } = useAudioEngine(scene);
  const { lowPower, reducedMotion } = usePerformanceTier();

  useEffect(() => {
    setScene(initialScene.scene);
    setSaved(initialScene);
  }, [initialScene, setSaved, setScene]);

  return (
    <div className="space-y-6">
      <div className="rounded-[34px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-cyan/75">Public soundscape</p>
            <h1 className="mt-2 font-display text-4xl text-white">{scene.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{scene.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (playbackStatus === "playing") {
                  void toggle();
                  return;
                }

                void start();
              }}
              className="rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-cyan transition hover:border-cyan/60"
            >
              {playbackStatus === "playing" ? (
                <Pause className="mr-2 inline h-4 w-4" />
              ) : (
                <Play className="mr-2 inline h-4 w-4" />
              )}
              {playbackStatus === "playing" ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => void copyToClipboard(initialScene.shareUrl)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 transition hover:border-white/20 hover:text-white"
            >
              <Share2 className="mr-2 inline h-4 w-4" />
              Copy link
            </button>
            <Link
              href="/"
              className="rounded-full border border-coral/30 bg-coral/10 px-4 py-2 text-sm text-coral transition hover:border-coral/60"
            >
              Open studio
            </Link>
          </div>
        </div>

        <SoundscapeCanvas scene={scene} metrics={metrics} lowPower={lowPower} reducedMotion={reducedMotion} />
      </div>
    </div>
  );
};
