from __future__ import annotations

from dataclasses import dataclass

from app.schemas.scene import (
    AudioLayerConfig,
    MoodBlend,
    MoodId,
    SceneControls,
    SceneSpec,
    VisualProfile
)


@dataclass(frozen=True)
class MoodConfig:
    tempo_range: tuple[int, int]
    scale: str
    root_keys: tuple[str, str]
    palette: tuple[str, str, str]
    gradient: tuple[str, str]
    intensity: float
    reverb: float
    filter_cutoff: float
    stereo_spread: float
    visual_energy: float
    particle_density: float
    fluidity: float
    bloom: float
    noise_scale: float
    motion_bias: float
    description: str


MOOD_CONFIG: dict[MoodId, MoodConfig] = {
    "calm": MoodConfig((72, 84), "lydian", ("C", "F"), ("#62f3ff", "#7c8cff", "#d9f7ff"), ("#071120", "#15294c"), 0.36, 0.78, 0.48, 0.66, 0.42, 0.48, 0.82, 0.64, 0.34, 0.35, "Soft tides, slow pulses, and suspended harmonics."),
    "relaxed": MoodConfig((78, 92), "major", ("C", "G"), ("#7bffc5", "#62f3ff", "#f1fff7"), ("#061510", "#10382a"), 0.44, 0.70, 0.56, 0.62, 0.46, 0.52, 0.76, 0.58, 0.38, 0.42, "Warm pads, drifting plucks, and gentle motion."),
    "energetic": MoodConfig((108, 126), "mixolydian", ("D", "A"), ("#ff8678", "#ffc266", "#ffd8d2"), ("#1c0d14", "#4d1a15"), 0.84, 0.34, 0.82, 0.54, 0.88, 0.86, 0.50, 0.72, 0.64, 0.90, "Pulsing rhythms, bright transients, and kinetic visuals."),
    "reflective": MoodConfig((76, 90), "dorian", ("Eb", "G"), ("#91a4ff", "#c8d1ff", "#89f0ff"), ("#0d1022", "#1f2d57"), 0.48, 0.74, 0.46, 0.72, 0.45, 0.50, 0.80, 0.60, 0.42, 0.40, "Glass chords and introspective harmonic movement."),
    "mystical": MoodConfig((82, 98), "phrygian", ("F", "Bb"), ("#d7a7ff", "#7c8cff", "#62f3ff"), ("#12091f", "#2a1955"), 0.60, 0.82, 0.44, 0.80, 0.58, 0.72, 0.90, 0.84, 0.54, 0.56, "Shimmering detune, evolving noise, and aurora gradients."),
    "joyful": MoodConfig((96, 116), "major", ("G", "D"), ("#ffe87b", "#ff8678", "#7bffc5"), ("#1f1204", "#45300d"), 0.74, 0.42, 0.76, 0.58, 0.80, 0.78, 0.62, 0.70, 0.56, 0.76, "Sparkling motifs and bright, buoyant light trails."),
    "melancholic": MoodConfig((70, 82), "minor", ("A", "Eb"), ("#6c8bff", "#8ea2c8", "#cfd9ff"), ("#080d1b", "#16233a"), 0.34, 0.86, 0.32, 0.70, 0.34, 0.42, 0.88, 0.50, 0.30, 0.28, "Faded piano colors, deeper tails, and blue-space echoes."),
    "focused": MoodConfig((88, 104), "dorian", ("D", "C"), ("#62f3ff", "#7bffc5", "#f3fffd"), ("#071217", "#103540"), 0.56, 0.30, 0.68, 0.42, 0.62, 0.60, 0.52, 0.46, 0.48, 0.64, "Precision pulses, restrained ambience, and clean geometry.")
}

KEY_SIGNATURES = ["C", "D", "Eb", "F", "G", "A", "Bb"]


def clamp(value: float, minimum: float = 0, maximum: float = 1) -> float:
    return min(max(value, minimum), maximum)


def weighted(values: list[float], weights: list[float]) -> float:
    return sum(value * weights[index] for index, value in enumerate(values))


def normalize_blend(blend: list[MoodBlend]) -> list[MoodBlend]:
    filtered = [entry for entry in blend if entry.weight > 0]
    if not filtered:
        return [MoodBlend(mood="calm", weight=1.0)]

    filtered = sorted(filtered, key=lambda entry: entry.weight, reverse=True)[:3]
    total = sum(entry.weight for entry in filtered) or 1
    normalized = [round(entry.weight / total, 4) for entry in filtered]
    normalized[-1] = round(normalized[-1] + (1 - sum(normalized)), 4)
    return [
        MoodBlend(mood=entry.mood, weight=normalized[index])
        for index, entry in enumerate(filtered)
    ]


def build_visual_profile(blend: list[MoodBlend]) -> VisualProfile:
    configs = [MOOD_CONFIG[entry.mood] for entry in blend]
    weights = [entry.weight for entry in blend]
    palette = [color for config in configs for color in config.palette][:5]
    gradient = list(dict.fromkeys([color for config in configs for color in config.gradient]))[:3]

    return VisualProfile(
        palette=palette,
        gradient=gradient,
        particle_density=weighted([config.particle_density for config in configs], weights),
        fluidity=weighted([config.fluidity for config in configs], weights),
        bloom=weighted([config.bloom for config in configs], weights),
        noise_scale=weighted([config.noise_scale for config in configs], weights),
        motion_bias=weighted([config.motion_bias for config in configs], weights)
    )


def build_title(blend: list[MoodBlend]) -> str:
    labels = [entry.mood.title() for entry in blend[:2]]
    return f"{' x '.join(labels)} Drift"


def build_description(blend: list[MoodBlend]) -> str:
    return " ".join(MOOD_CONFIG[entry.mood].description for entry in blend[:2])


def choose_key(blend: list[MoodBlend], seed: int) -> str:
    scores = {key: 0.0 for key in KEY_SIGNATURES}
    for entry in blend:
        root_primary, root_secondary = MOOD_CONFIG[entry.mood].root_keys
        scores[root_primary] += entry.weight * 1.2
        scores[root_secondary] += entry.weight * 0.8

    ordered = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    return ordered[seed % len(ordered)][0]


def build_scene_from_blend(blend: list[MoodBlend], seed: int) -> SceneSpec:
    normalized = normalize_blend(blend)
    configs = [MOOD_CONFIG[entry.mood] for entry in normalized]
    weights = [entry.weight for entry in normalized]
    dominant = configs[0]

    controls = SceneControls(
        intensity=weighted([config.intensity for config in configs], weights),
        filter_cutoff=weighted([config.filter_cutoff for config in configs], weights),
        reverb=weighted([config.reverb for config in configs], weights),
        stereo_spread=weighted([config.stereo_spread for config in configs], weights),
        visual_energy=weighted([config.visual_energy for config in configs], weights),
        master_volume=0.88,
        tempo_jitter=0.08
    )

    visual = build_visual_profile(normalized)
    layers = [
        AudioLayerConfig(id="pad", label="Tidal Pad", role="pad", enabled=True, gain=clamp(0.72 + controls.reverb * 0.14), pan=-0.18 * controls.stereo_spread, density=clamp(0.42 + controls.intensity * 0.3), color=visual.palette[0]),
        AudioLayerConfig(id="pulse", label="Pulse Current", role="pulse", enabled=True, gain=clamp(0.52 + controls.intensity * 0.32), pan=0.08, density=clamp(0.36 + controls.visual_energy * 0.46), color=visual.palette[1] if len(visual.palette) > 1 else visual.palette[0]),
        AudioLayerConfig(id="texture", label="Mist Texture", role="texture", enabled=True, gain=clamp(0.34 + controls.reverb * 0.24), pan=0.16 * controls.stereo_spread, density=clamp(0.44 + controls.reverb * 0.22), color=visual.palette[2] if len(visual.palette) > 2 else visual.palette[0]),
        AudioLayerConfig(id="sparkle", label="Halo Sparkles", role="sparkle", enabled=True, gain=clamp(0.24 + controls.visual_energy * 0.3), pan=0.24, density=clamp(0.32 + controls.intensity * 0.48), color=visual.palette[3] if len(visual.palette) > 3 else visual.palette[0])
    ]

    return SceneSpec(
        version="1.0.0",
        title=build_title(normalized),
        description=build_description(normalized),
        mood_blend=normalized,
        controls=controls,
        layers=layers,
        visual_profile=visual,
        tempo=round(weighted([(config.tempo_range[0] + config.tempo_range[1]) / 2 for config in configs], weights)),
        key=choose_key(normalized, seed % len(KEY_SIGNATURES)),
        scale=dominant.scale,
        seed=seed,
        duration_hint=60
    )


def canonicalize_scene(scene: SceneSpec) -> SceneSpec:
    base = build_scene_from_blend(scene.mood_blend, scene.seed)
    incoming_layers = {layer.id: layer for layer in scene.layers}

    layers = []
    for layer in base.layers:
        current = incoming_layers.get(layer.id)
        if current is None:
            layers.append(layer)
            continue

        layers.append(
            layer.model_copy(
                update={
                    "enabled": current.enabled,
                    "gain": clamp(current.gain),
                    "pan": clamp(current.pan, -1, 1),
                    "density": clamp(current.density),
                    "color": current.color or layer.color
                }
            )
        )

    controls = base.controls.model_copy(
        update={
            "intensity": clamp(scene.controls.intensity),
            "filter_cutoff": clamp(scene.controls.filter_cutoff),
            "reverb": clamp(scene.controls.reverb),
            "stereo_spread": clamp(scene.controls.stereo_spread),
            "visual_energy": clamp(scene.controls.visual_energy),
            "master_volume": clamp(scene.controls.master_volume),
            "tempo_jitter": clamp(scene.controls.tempo_jitter)
        }
    )

    visual = base.visual_profile.model_copy(
        update={
            "palette": scene.visual_profile.palette or base.visual_profile.palette,
            "gradient": scene.visual_profile.gradient or base.visual_profile.gradient,
            "particle_density": clamp(scene.visual_profile.particle_density),
            "fluidity": clamp(scene.visual_profile.fluidity),
            "bloom": clamp(scene.visual_profile.bloom),
            "noise_scale": clamp(scene.visual_profile.noise_scale),
            "motion_bias": clamp(scene.visual_profile.motion_bias)
        }
    )

    return base.model_copy(
        update={
            "slug": scene.slug,
            "title": scene.title or base.title,
            "description": scene.description or base.description,
            "controls": controls,
            "layers": layers,
            "visual_profile": visual,
            "tempo": int(scene.tempo or base.tempo),
            "key": scene.key or base.key,
            "scale": scene.scale or base.scale,
            "duration_hint": scene.duration_hint or base.duration_hint
        }
    )
