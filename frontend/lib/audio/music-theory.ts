import type { SceneSpec } from "@/lib/scene/types";

const ROOT_TO_SEMITONE: Record<string, number> = {
  C: 0,
  D: 2,
  Eb: 3,
  F: 5,
  G: 7,
  A: 9,
  Bb: 10
};

const SCALE_INTERVALS: Record<string, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10]
};

const NOTE_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const midiToNote = (midi: number) => `${NOTE_NAMES[(midi + 1200) % 12]}${Math.floor(midi / 12) - 1}`;

export const createSeededRandom = (seed: number) => {
  let current = seed >>> 0;

  return () => {
    current += 0x6d2b79f5;
    let value = Math.imul(current ^ (current >>> 15), 1 | current);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export const buildScaleNotes = (scene: SceneSpec, octave = 4) => {
  const rootMidi = 12 * (octave + 1) + ROOT_TO_SEMITONE[scene.key];
  const intervals = SCALE_INTERVALS[scene.scale] ?? SCALE_INTERVALS.major;
  return intervals.map((interval) => midiToNote(rootMidi + interval));
};

export const buildChord = (scene: SceneSpec, octave = 3) => {
  const rootMidi = 12 * (octave + 1) + ROOT_TO_SEMITONE[scene.key];
  const intervals = SCALE_INTERVALS[scene.scale] ?? SCALE_INTERVALS.major;
  return [0, 2, 4, 6].map((degree, index) => midiToNote(rootMidi + intervals[degree] + (index >= 2 ? 12 : 0)));
};

export const buildPulsePattern = (scene: SceneSpec) => {
  const notes = buildScaleNotes(scene, 3);
  const density = scene.layers.find((layer) => layer.id === "pulse")?.density ?? 0.5;
  const random = createSeededRandom(scene.seed + 31);

  return Array.from({ length: 8 }, (_, index) => {
    if (random() > density * 0.9) {
      return null;
    }

    return notes[(index + Math.floor(random() * notes.length)) % notes.length];
  });
};

export const buildSparklePattern = (scene: SceneSpec) => {
  const notes = buildScaleNotes(scene, 5);
  const random = createSeededRandom(scene.seed + 73);

  return Array.from({ length: 12 }, (_, index) => notes[(index + Math.floor(random() * 3)) % notes.length]);
};
