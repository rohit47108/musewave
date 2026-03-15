"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { museWaveToneEngine } from "@/lib/audio/tone-engine";
import { useMuseWaveStore } from "@/lib/store";
import type { SceneSpec } from "@/lib/scene/types";
import { sceneSignature } from "@/lib/scene/utils";

export const useAudioEngine = (scene: SceneSpec) => {
  const setMetrics = useMuseWaveStore((state) => state.setMetrics);
  const setPlaybackStatus = useMuseWaveStore((state) => state.setPlaybackStatus);
  const [error, setError] = useState<string>();

  const signature = useMemo(() => sceneSignature(scene), [scene]);

  useEffect(() => {
    const unsubscribe = museWaveToneEngine.subscribe((metrics) => setMetrics(metrics));
    return unsubscribe;
  }, [setMetrics]);

  useEffect(() => {
    museWaveToneEngine.updateScene(scene).catch((nextError: Error) => {
      setError(nextError.message);
      setPlaybackStatus("error");
    });
  }, [scene, signature, setPlaybackStatus]);

  const start = useCallback(async () => {
    try {
      await museWaveToneEngine.start(scene);
      setPlaybackStatus("playing");
      setError(undefined);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to start audio.");
      setPlaybackStatus("error");
    }
  }, [scene, setPlaybackStatus]);

  const toggle = useCallback(async () => {
    if (museWaveToneEngine.playing) {
      museWaveToneEngine.pause();
      setPlaybackStatus("paused");
      return;
    }

    if (!museWaveToneEngine.playing) {
      await start();
    }
  }, [setPlaybackStatus, start]);

  return {
    start,
    toggle,
    error,
    isPlaying: museWaveToneEngine.playing
  };
};
