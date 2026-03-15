import { KEY_SIGNATURES, MOOD_CONFIG, MOOD_ORDER } from "@/lib/scene/moods";
import type {
  AudioLayerConfig,
  MoodBlend,
  MoodId,
  SceneControls,
  SceneSpec,
  VisualProfile
} from "@/lib/scene/types";

const VERSION = "1.0.0";

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const weighted = (values: number[], weights: number[]) =>
  values.reduce((sum, value, index) => sum + value * weights[index], 0);

const pickKey = (blend: MoodBlend[], seed: number) => {
  const bias = blend
    .map(({ mood, weight }) => {
      const roots = MOOD_CONFIG[mood].rootKeys;
      const weightedRoots = roots.map((root, index) => ({
        root,
        weight: weight * (index === 0 ? 1.2 : 0.8)
      }));
      return weightedRoots;
    })
    .flat();

  const scores = KEY_SIGNATURES.map((key) =>
    bias.reduce((score, item) => score + (item.root === key ? item.weight : 0), 0)
  );

  const bestIndex = scores.indexOf(Math.max(...scores));
  return KEY_SIGNATURES[(bestIndex + seed) % KEY_SIGNATURES.length];
};

export const normalizeBlend = (blend: MoodBlend[]): MoodBlend[] => {
  const filtered = blend
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => {
      if (b.weight !== a.weight) {
        return b.weight - a.weight;
      }

      return MOOD_ORDER.indexOf(a.mood) - MOOD_ORDER.indexOf(b.mood);
    })
    .slice(0, 3);

  if (!filtered.length) {
    return [{ mood: "calm", weight: 1 }];
  }

  const total = filtered.reduce((sum, entry) => sum + entry.weight, 0);
  const normalized = filtered.map((entry) => Number((entry.weight / total).toFixed(4)));
  normalized[normalized.length - 1] = Number(
    (normalized[normalized.length - 1] + (1 - normalized.reduce((sum, value) => sum + value, 0))).toFixed(4)
  );

  return filtered.map((entry, index) => ({
    ...entry,
    weight: normalized[index]
  }));
};

export const buildVisualProfile = (blend: MoodBlend[]): VisualProfile => {
  const weights = blend.map((entry) => entry.weight);
  const configs = blend.map((entry) => MOOD_CONFIG[entry.mood]);
  const palette = configs.flatMap((config) => config.palette).slice(0, 5);
  const gradient = configs
    .flatMap((config) => config.gradient)
    .filter((color, index, list) => list.indexOf(color) === index)
    .slice(0, 3);

  return {
    palette,
    gradient,
    particleDensity: weighted(configs.map((config) => config.particleDensity), weights),
    fluidity: weighted(configs.map((config) => config.fluidity), weights),
    bloom: weighted(configs.map((config) => config.bloom), weights),
    noiseScale: weighted(configs.map((config) => config.noiseScale), weights),
    motionBias: weighted(configs.map((config) => config.motionBias), weights)
  };
};

const layerFactory = (visual: VisualProfile, controls: SceneControls): AudioLayerConfig[] => [
  {
    id: "pad",
    label: "Tidal Pad",
    role: "pad",
    enabled: true,
    gain: clamp(0.7 + controls.reverb * 0.15),
    pan: -0.18 * controls.stereoSpread,
    density: clamp(0.42 + controls.intensity * 0.3),
    color: visual.palette[0] ?? "#62f3ff"
  },
  {
    id: "pulse",
    label: "Pulse Current",
    role: "pulse",
    enabled: true,
    gain: clamp(0.5 + controls.intensity * 0.35),
    pan: 0.08,
    density: clamp(0.38 + controls.visualEnergy * 0.48),
    color: visual.palette[1] ?? "#ff8678"
  },
  {
    id: "texture",
    label: "Mist Texture",
    role: "texture",
    enabled: true,
    gain: clamp(0.34 + controls.reverb * 0.26),
    pan: 0.16 * controls.stereoSpread,
    density: clamp(0.45 + controls.reverb * 0.22),
    color: visual.palette[2] ?? "#7bffc5"
  },
  {
    id: "sparkle",
    label: "Halo Sparkles",
    role: "sparkle",
    enabled: true,
    gain: clamp(0.22 + controls.visualEnergy * 0.34),
    pan: 0.28,
    density: clamp(0.32 + controls.intensity * 0.5),
    color: visual.palette[3] ?? "#f6f8ff"
  }
];

const buildTitle = (blend: MoodBlend[]) =>
  blend
    .map(({ mood }) => MOOD_CONFIG[mood].label)
    .slice(0, 2)
    .join(" x ")
    .concat(" Drift");

const buildDescription = (blend: MoodBlend[]) =>
  blend
    .map(({ mood }) => MOOD_CONFIG[mood].description)
    .slice(0, 2)
    .join(" ");

export const buildSceneFromBlend = (blend: MoodBlend[], seed = 7): SceneSpec => {
  const normalized = normalizeBlend(blend);
  const configs = normalized.map((entry) => MOOD_CONFIG[entry.mood]);
  const weights = normalized.map((entry) => entry.weight);
  const dominant = configs[0];

  const controls: SceneControls = {
    intensity: weighted(configs.map((config) => config.intensity), weights),
    filterCutoff: weighted(configs.map((config) => config.filterCutoff), weights),
    reverb: weighted(configs.map((config) => config.reverb), weights),
    stereoSpread: weighted(configs.map((config) => config.stereoSpread), weights),
    visualEnergy: weighted(configs.map((config) => config.visualEnergy), weights),
    masterVolume: 0.88,
    tempoJitter: 0.08
  };

  const visualProfile = buildVisualProfile(normalized);

  return {
    version: VERSION,
    title: buildTitle(normalized),
    description: buildDescription(normalized),
    moodBlend: normalized,
    controls,
    layers: layerFactory(visualProfile, controls),
    visualProfile,
    tempo: Math.round(weighted(configs.map((config) => (config.tempoRange[0] + config.tempoRange[1]) / 2), weights)),
    key: pickKey(normalized, seed % KEY_SIGNATURES.length),
    scale: dominant.scale,
    seed,
    durationHint: 60
  };
};

export const setMoodWeight = (scene: SceneSpec, mood: MoodId, nextWeight: number): SceneSpec => {
  const otherEntries = scene.moodBlend.filter((entry) => entry.mood !== mood);
  const withTarget = nextWeight <= 0 ? otherEntries : [...otherEntries, { mood, weight: nextWeight }];
  return {
    ...buildSceneFromBlend(withTarget, scene.seed),
    slug: scene.slug
  };
};

export const updateControls = (
  scene: SceneSpec,
  patch: Partial<SceneControls>
): SceneSpec => {
  const controls = {
    ...scene.controls,
    ...patch
  };

  return {
    ...scene,
    controls,
    layers: scene.layers.map((layer, index) => ({
      ...layer,
      gain: clamp(layer.gain + (index === 1 ? controls.intensity * 0.06 : 0)),
      density: clamp(layer.density + controls.visualEnergy * 0.04)
    })),
    visualProfile: {
      ...scene.visualProfile,
      bloom: clamp(scene.visualProfile.bloom + (controls.visualEnergy - scene.controls.visualEnergy) * 0.4),
      motionBias: clamp(scene.visualProfile.motionBias + (controls.intensity - scene.controls.intensity) * 0.5)
    }
  };
};

export const formatMoodBlend = (blend: MoodBlend[]) =>
  normalizeBlend(blend)
    .map(({ mood, weight }) => `${MOOD_CONFIG[mood].label} ${(weight * 100).toFixed(0)}%`)
    .join(" / ");

export const sceneSignature = (scene: SceneSpec) =>
  JSON.stringify({
    moodBlend: scene.moodBlend,
    controls: scene.controls,
    layers: scene.layers.map(({ id, enabled, gain, density, pan }) => ({
      id,
      enabled,
      gain,
      density,
      pan
    })),
    tempo: scene.tempo,
    key: scene.key,
    scale: scene.scale,
    seed: scene.seed
  });

