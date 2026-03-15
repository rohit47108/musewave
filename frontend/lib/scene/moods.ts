import type { MoodId } from "@/lib/scene/types";

export interface MoodConfig {
  id: MoodId;
  label: string;
  description: string;
  tempoRange: [number, number];
  scale: string;
  rootKeys: string[];
  palette: [string, string, string];
  gradient: [string, string];
  intensity: number;
  reverb: number;
  filterCutoff: number;
  stereoSpread: number;
  visualEnergy: number;
  particleDensity: number;
  fluidity: number;
  bloom: number;
  noiseScale: number;
  motionBias: number;
}

export const MOOD_ORDER: MoodId[] = [
  "calm",
  "relaxed",
  "energetic",
  "reflective",
  "mystical",
  "joyful",
  "melancholic",
  "focused"
];

export const KEY_SIGNATURES = ["C", "D", "Eb", "F", "G", "A", "Bb"] as const;

export const MOOD_CONFIG: Record<MoodId, MoodConfig> = {
  calm: {
    id: "calm",
    label: "Calm",
    description: "Soft tides, slow pulses, and suspended harmonics.",
    tempoRange: [72, 84],
    scale: "lydian",
    rootKeys: ["C", "F"],
    palette: ["#62f3ff", "#7c8cff", "#d9f7ff"],
    gradient: ["#071120", "#15294c"],
    intensity: 0.36,
    reverb: 0.78,
    filterCutoff: 0.48,
    stereoSpread: 0.66,
    visualEnergy: 0.42,
    particleDensity: 0.48,
    fluidity: 0.82,
    bloom: 0.64,
    noiseScale: 0.34,
    motionBias: 0.35
  },
  relaxed: {
    id: "relaxed",
    label: "Relaxed",
    description: "Warm pads, drifting plucks, and gentle motion.",
    tempoRange: [78, 92],
    scale: "major",
    rootKeys: ["C", "G"],
    palette: ["#7bffc5", "#62f3ff", "#f1fff7"],
    gradient: ["#061510", "#10382a"],
    intensity: 0.44,
    reverb: 0.7,
    filterCutoff: 0.56,
    stereoSpread: 0.62,
    visualEnergy: 0.46,
    particleDensity: 0.52,
    fluidity: 0.76,
    bloom: 0.58,
    noiseScale: 0.38,
    motionBias: 0.42
  },
  energetic: {
    id: "energetic",
    label: "Energetic",
    description: "Pulsing rhythms, bright transients, and kinetic visuals.",
    tempoRange: [108, 126],
    scale: "mixolydian",
    rootKeys: ["D", "A"],
    palette: ["#ff8678", "#ffc266", "#ffd8d2"],
    gradient: ["#1c0d14", "#4d1a15"],
    intensity: 0.84,
    reverb: 0.34,
    filterCutoff: 0.82,
    stereoSpread: 0.54,
    visualEnergy: 0.88,
    particleDensity: 0.86,
    fluidity: 0.5,
    bloom: 0.72,
    noiseScale: 0.64,
    motionBias: 0.9
  },
  reflective: {
    id: "reflective",
    label: "Reflective",
    description: "Glass chords and introspective harmonic movement.",
    tempoRange: [76, 90],
    scale: "dorian",
    rootKeys: ["Eb", "G"],
    palette: ["#91a4ff", "#c8d1ff", "#89f0ff"],
    gradient: ["#0d1022", "#1f2d57"],
    intensity: 0.48,
    reverb: 0.74,
    filterCutoff: 0.46,
    stereoSpread: 0.72,
    visualEnergy: 0.45,
    particleDensity: 0.5,
    fluidity: 0.8,
    bloom: 0.6,
    noiseScale: 0.42,
    motionBias: 0.4
  },
  mystical: {
    id: "mystical",
    label: "Mystical",
    description: "Shimmering detune, evolving noise, and aurora gradients.",
    tempoRange: [82, 98],
    scale: "phrygian",
    rootKeys: ["F", "Bb"],
    palette: ["#d7a7ff", "#7c8cff", "#62f3ff"],
    gradient: ["#12091f", "#2a1955"],
    intensity: 0.6,
    reverb: 0.82,
    filterCutoff: 0.44,
    stereoSpread: 0.8,
    visualEnergy: 0.58,
    particleDensity: 0.72,
    fluidity: 0.9,
    bloom: 0.84,
    noiseScale: 0.54,
    motionBias: 0.56
  },
  joyful: {
    id: "joyful",
    label: "Joyful",
    description: "Sparkling motifs and bright, buoyant light trails.",
    tempoRange: [96, 116],
    scale: "major",
    rootKeys: ["G", "D"],
    palette: ["#ffe87b", "#ff8678", "#7bffc5"],
    gradient: ["#1f1204", "#45300d"],
    intensity: 0.74,
    reverb: 0.42,
    filterCutoff: 0.76,
    stereoSpread: 0.58,
    visualEnergy: 0.8,
    particleDensity: 0.78,
    fluidity: 0.62,
    bloom: 0.7,
    noiseScale: 0.56,
    motionBias: 0.76
  },
  melancholic: {
    id: "melancholic",
    label: "Melancholic",
    description: "Faded piano colors, deeper tails, and blue-space echoes.",
    tempoRange: [70, 82],
    scale: "minor",
    rootKeys: ["A", "Eb"],
    palette: ["#6c8bff", "#8ea2c8", "#cfd9ff"],
    gradient: ["#080d1b", "#16233a"],
    intensity: 0.34,
    reverb: 0.86,
    filterCutoff: 0.32,
    stereoSpread: 0.7,
    visualEnergy: 0.34,
    particleDensity: 0.42,
    fluidity: 0.88,
    bloom: 0.5,
    noiseScale: 0.3,
    motionBias: 0.28
  },
  focused: {
    id: "focused",
    label: "Focused",
    description: "Precision pulses, restrained ambience, and clean geometry.",
    tempoRange: [88, 104],
    scale: "dorian",
    rootKeys: ["D", "C"],
    palette: ["#62f3ff", "#7bffc5", "#f3fffd"],
    gradient: ["#071217", "#103540"],
    intensity: 0.56,
    reverb: 0.3,
    filterCutoff: 0.68,
    stereoSpread: 0.42,
    visualEnergy: 0.62,
    particleDensity: 0.6,
    fluidity: 0.52,
    bloom: 0.46,
    noiseScale: 0.48,
    motionBias: 0.64
  }
};
