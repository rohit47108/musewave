"use client";

import { motion } from "framer-motion";

import { MOOD_CONFIG, MOOD_ORDER } from "@/lib/scene/moods";
import type { MoodId, SceneSpec } from "@/lib/scene/types";
import { cn, formatPercent } from "@/lib/utils";

interface MoodSelectorProps {
  scene: SceneSpec;
  previewMood?: MoodId | null;
  onPreviewMood: (mood: MoodId | null) => void;
  onWeightChange: (mood: MoodId, weight: number) => void;
}

export const MoodSelector = ({
  scene,
  previewMood,
  onPreviewMood,
  onWeightChange
}: MoodSelectorProps) => {
  const activeMap = new Map(scene.moodBlend.map((entry) => [entry.mood, entry.weight]));

  return (
    <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-cyan/80">Mood blend</p>
          <h2 className="mt-2 font-display text-2xl text-white">Shape the atmosphere</h2>
        </div>
        <p className="max-w-xs text-right text-sm text-white/55">
          Blend up to three moods. Hover a card to preview its visual signature before committing.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {MOOD_ORDER.map((mood) => {
          const config = MOOD_CONFIG[mood];
          const weight = activeMap.get(mood) ?? 0;
          const active = weight > 0;

          return (
            <motion.button
              key={mood}
              type="button"
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={() => onPreviewMood(mood)}
              onMouseLeave={() => onPreviewMood(null)}
              onFocus={() => onPreviewMood(mood)}
              onBlur={() => onPreviewMood(null)}
              onClick={() => onWeightChange(mood, active ? 0 : 0.34)}
              className={cn(
                "group rounded-[24px] border p-4 text-left transition-all duration-300",
                active || previewMood === mood
                  ? "border-cyan/30 bg-white/10 shadow-glow"
                  : "border-white/8 bg-black/10 hover:border-white/20 hover:bg-white/6"
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${config.palette[0]}, ${config.palette[1]})`
                      }}
                    />
                    <span className="text-sm uppercase tracking-[0.28em] text-white/45">
                      {active ? "Active" : "Preview"}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl text-white">{config.label}</h3>
                </div>

                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                  {formatPercent(weight)}
                </span>
              </div>

              <p className="min-h-12 text-sm leading-6 text-white/60">{config.description}</p>

              <div className="mt-5 space-y-2">
                <input
                  aria-label={`${config.label} blend weight`}
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(weight * 100)}
                  onChange={(event) => onWeightChange(mood, Number(event.target.value) / 100)}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-cyan"
                />
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/35">
                  <span>Tempo {config.tempoRange[0]}-{config.tempoRange[1]}</span>
                  <span>{config.scale}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};
