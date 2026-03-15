export type MoodId =
  | "calm"
  | "relaxed"
  | "energetic"
  | "reflective"
  | "mystical"
  | "joyful"
  | "melancholic"
  | "focused";

export type LayerRole = "pad" | "pulse" | "texture" | "sparkle";

export interface MoodBlend {
  mood: MoodId;
  weight: number;
}

export interface SceneControls {
  intensity: number;
  filterCutoff: number;
  reverb: number;
  stereoSpread: number;
  visualEnergy: number;
  masterVolume: number;
  tempoJitter: number;
}

export interface AudioLayerConfig {
  id: string;
  label: string;
  role: LayerRole;
  enabled: boolean;
  gain: number;
  pan: number;
  density: number;
  color: string;
}

export interface VisualProfile {
  palette: string[];
  gradient: string[];
  particleDensity: number;
  fluidity: number;
  bloom: number;
  noiseScale: number;
  motionBias: number;
}

export interface SceneSpec {
  version: string;
  slug?: string | null;
  title: string;
  description: string;
  moodBlend: MoodBlend[];
  controls: SceneControls;
  layers: AudioLayerConfig[];
  visualProfile: VisualProfile;
  tempo: number;
  key: string;
  scale: string;
  seed: number;
  durationHint: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ShareSceneRequest {
  slug?: string;
  scene: SceneSpec;
  authorName?: string;
  coverTheme?: string;
}

export interface ShareSceneResponse {
  slug: string;
  shareUrl: string;
  embedUrl: string;
  ogImageUrl: string;
  scene: SceneSpec;
  createdAt: string;
  updatedAt: string;
}

export type ExportDuration = 30 | 60 | 120;

export interface ExportJob {
  id: string;
  slug: string;
  durationSeconds: ExportDuration;
  status: "queued" | "processing" | "completed" | "failed";
  audioUrl?: string | null;
  sceneUrl?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmbedConfig {
  autoplay?: boolean;
  minimalUI?: boolean;
  theme?: "dark" | "light";
}

export interface AudioMetrics {
  energy: number;
  bass: number;
  mid: number;
  treble: number;
  waveform: number[];
  tick: number;
}
