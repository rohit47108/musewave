"use client";

import { useEffect } from "react";
import { Pause, Play } from "lucide-react";

import { SoundscapeCanvas } from "@/components/editor/SoundscapeCanvas";
import { useAudioEngine } from "@/lib/audio/use-audio-engine";
import type { ShareSceneResponse } from "@/lib/scene/types";
import { usePerformanceTier } from "@/lib/hooks/use-performance-tier";
import { useMuseWaveStore } from "@/lib/store";

interface EmbedPlayerProps {
  initialScene: ShareSceneResponse;
  autoplay?: boolean;
}

export const EmbedPlayer = ({ initialScene, autoplay }: EmbedPlayerProps) => {
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

  useEffect(() => {
    if (autoplay) {
      void start();
    }
  }, [autoplay, start]);

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#050816] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-xl text-white">{scene.title}</p>
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">
            {scene.key} {scene.scale} · {scene.tempo} BPM
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (playbackStatus === "playing") {
              void toggle();
              return;
            }

            void start();
          }}
          className="rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-cyan"
        >
          {playbackStatus === "playing" ? (
            <Pause className="mr-2 inline h-4 w-4" />
          ) : (
            <Play className="mr-2 inline h-4 w-4" />
          )}
          {playbackStatus === "playing" ? "Pause" : "Play"}
        </button>
      </div>

      <SoundscapeCanvas
        scene={scene}
        metrics={metrics}
        lowPower={lowPower}
        reducedMotion={reducedMotion}
        compact
      />
    </div>
  );
};
