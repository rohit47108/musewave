"use client";

import { create } from "zustand";

import { createDefaultScene } from "@/lib/scene/default-scene";
import type {
  AudioMetrics,
  AudioLayerConfig,
  ExportJob,
  MoodBlend,
  MoodId,
  SceneControls,
  SceneSpec,
  ShareSceneResponse
} from "@/lib/scene/types";
import { buildSceneFromBlend, updateControls } from "@/lib/scene/utils";

type PlaybackStatus = "idle" | "ready" | "playing" | "paused" | "error";

interface MuseWaveState {
  scene: SceneSpec;
  metrics: AudioMetrics;
  playbackStatus: PlaybackStatus;
  lastSaved?: ShareSceneResponse;
  currentExport?: ExportJob;
  setScene: (scene: SceneSpec) => void;
  setPlaybackStatus: (status: PlaybackStatus) => void;
  setMetrics: (metrics: AudioMetrics) => void;
  setSaved: (saved?: ShareSceneResponse) => void;
  setExportJob: (job?: ExportJob) => void;
  resetScene: () => void;
  setMoodWeight: (mood: MoodId, weight: number) => void;
  setControl: <K extends keyof SceneControls>(key: K, value: SceneControls[K]) => void;
  toggleLayer: (id: string) => void;
  patchLayer: (id: string, patch: Partial<AudioLayerConfig>) => void;
}

const emptyMetrics: AudioMetrics = {
  energy: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  waveform: Array.from({ length: 48 }, () => 0),
  tick: 0
};

const upsertMoodBlend = (blend: MoodBlend[], mood: MoodId, weight: number) => {
  const next = blend.filter((entry) => entry.mood !== mood);

  if (weight > 0) {
    next.push({ mood, weight });
  }

  return next.sort((a, b) => b.weight - a.weight).slice(0, 3);
};

export const useMuseWaveStore = create<MuseWaveState>((set) => ({
  scene: createDefaultScene(),
  metrics: emptyMetrics,
  playbackStatus: "idle",
  setScene: (scene) => set({ scene }),
  setPlaybackStatus: (playbackStatus) => set({ playbackStatus }),
  setMetrics: (metrics) => set({ metrics }),
  setSaved: (lastSaved) => set({ lastSaved }),
  setExportJob: (currentExport) => set({ currentExport }),
  resetScene: () =>
    set({
      scene: createDefaultScene(),
      lastSaved: undefined,
      currentExport: undefined
    }),
  setMoodWeight: (mood, weight) =>
    set((state) => ({
      scene: buildSceneFromBlend(upsertMoodBlend(state.scene.moodBlend, mood, weight), state.scene.seed + 1)
    })),
  setControl: (key, value) =>
    set((state) => ({
      scene: updateControls(state.scene, {
        [key]: value
      })
    })),
  toggleLayer: (id) =>
    set((state) => ({
      scene: {
        ...state.scene,
        layers: state.scene.layers.map((layer) =>
          layer.id === id ? { ...layer, enabled: !layer.enabled } : layer
        )
      }
    })),
  patchLayer: (id, patch) =>
    set((state) => ({
      scene: {
        ...state.scene,
        layers: state.scene.layers.map((layer) =>
          layer.id === id ? { ...layer, ...patch } : layer
        )
      }
    }))
}));
