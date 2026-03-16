"use client";

import { Link2, SlidersHorizontal } from "lucide-react";

import type { AudioLayerConfig, SceneControls, SceneSpec } from "@/lib/scene/types";
import { cn, formatPercent } from "@/lib/utils";

interface RemixControlsProps {
  scene: SceneSpec;
  onControlChange: <K extends keyof SceneControls>(key: K, value: SceneControls[K]) => void;
  onToggleLayer: (id: string) => void;
  onPatchLayer: (id: string, patch: Partial<AudioLayerConfig>) => void;
}

const controls: Array<{ key: keyof SceneControls; label: string; min: number; max: number; step: number }> = [
  { key: "intensity", label: "Intensity", min: 0, max: 1, step: 0.01 },
  { key: "filterCutoff", label: "Filter", min: 0, max: 1, step: 0.01 },
  { key: "reverb", label: "Reverb", min: 0, max: 1, step: 0.01 },
  { key: "stereoSpread", label: "Stereo", min: 0, max: 1, step: 0.01 },
  { key: "visualEnergy", label: "Visual energy", min: 0, max: 1, step: 0.01 },
  { key: "masterVolume", label: "Master", min: 0.1, max: 1, step: 0.01 }
];

export const RemixControls = ({
  scene,
  onControlChange,
  onToggleLayer,
  onPatchLayer
}: RemixControlsProps) => (
  <section className="space-y-5 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-coral/80">Remix console</p>
        <h2 className="mt-2 font-display text-2xl text-white">Live sculpting controls</h2>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/65">
        <SlidersHorizontal className="h-4 w-4 text-mint" />
        {scene.key} {scene.scale} / {scene.tempo} BPM
      </div>
    </div>

    <div className="grid gap-3 md:grid-cols-2">
      {controls.map((control) => (
        <label
          key={control.key}
          className="rounded-[22px] border border-white/10 bg-black/10 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm uppercase tracking-[0.24em] text-white/45">{control.label}</span>
            <span className="text-sm text-white">{formatPercent(scene.controls[control.key])}</span>
          </div>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={scene.controls[control.key]}
            onChange={(event) =>
              onControlChange(control.key, Number(event.target.value) as SceneControls[typeof control.key])
            }
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-coral"
          />
        </label>
      ))}
    </div>

    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-white">Layer stack</h3>
        <p className="text-sm text-white/55">Toggle layers or rebalance density and gain.</p>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {scene.layers.map((layer) => (
          <div
            key={layer.id}
            className={cn(
              "rounded-[24px] border p-4 transition-colors",
              layer.enabled ? "border-white/15 bg-white/7" : "border-white/8 bg-black/15"
            )}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: layer.color }}
                />
                <div>
                  <p className="font-display text-lg text-white">{layer.label}</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">{layer.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onToggleLayer(layer.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-xs uppercase tracking-[0.24em]",
                  layer.enabled
                    ? "border border-mint/30 bg-mint/10 text-mint"
                    : "border border-white/10 bg-white/5 text-white/45"
                )}
              >
                {layer.enabled ? "On" : "Off"}
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/45">
                  <span>Gain</span>
                  <span>{formatPercent(layer.gain)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={layer.gain}
                  onChange={(event) => onPatchLayer(layer.id, { gain: Number(event.target.value) })}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-mint"
                />
              </label>
              <label className="block">
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/45">
                  <span>Density</span>
                  <span>{formatPercent(layer.density)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={layer.density}
                  onChange={(event) => onPatchLayer(layer.id, { density: Number(event.target.value) })}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-[24px] border border-coral/20 bg-coral/8 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl text-white">Share-first launch</h3>
          <p className="mt-1 text-sm text-white/60">
            Save a scene to generate a public player page, embed code, and social preview artwork. Download exports can be added later without changing your saved scenes.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-coral/30 bg-black/20 px-4 py-2 text-sm text-white/80">
          <Link2 className="h-4 w-4 text-coral" />
          Share links only
        </div>
      </div>
    </div>
  </section>
);
