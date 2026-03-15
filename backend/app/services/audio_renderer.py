from __future__ import annotations

import io
import json
import math
from typing import Iterable

import numpy as np
import soundfile as sf

from app.schemas.scene import SceneSpec

try:
    from pedalboard import Compressor, Limiter, LowpassFilter, Pedalboard, Reverb
except Exception:  # pragma: no cover - optional in constrained environments
    Pedalboard = None


ROOT_TO_SEMITONE = {
    "C": 0,
    "D": 2,
    "Eb": 3,
    "F": 5,
    "G": 7,
    "A": 9,
    "Bb": 10
}

SCALE_INTERVALS = {
    "major": [0, 2, 4, 5, 7, 9, 11],
    "minor": [0, 2, 3, 5, 7, 8, 10],
    "dorian": [0, 2, 3, 5, 7, 9, 10],
    "lydian": [0, 2, 4, 6, 7, 9, 11],
    "mixolydian": [0, 2, 4, 5, 7, 9, 10],
    "phrygian": [0, 1, 3, 5, 7, 8, 10]
}


def midi_to_freq(midi: int) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def build_scale(scene: SceneSpec, octave: int) -> list[float]:
    root_midi = 12 * (octave + 1) + ROOT_TO_SEMITONE[scene.key]
    intervals = SCALE_INTERVALS.get(scene.scale, SCALE_INTERVALS["major"])
    return [midi_to_freq(root_midi + interval) for interval in intervals]


def build_chord(scene: SceneSpec, octave: int) -> list[float]:
    scale = build_scale(scene, octave)
    return [scale[0], scale[2], scale[4], scale[6]]


def envelope(length: int, attack: float, release: float) -> np.ndarray:
    attack_samples = max(1, int(length * attack))
    release_samples = max(1, int(length * release))
    sustain_samples = max(length - attack_samples - release_samples, 1)
    attack_curve = np.linspace(0, 1, attack_samples, endpoint=False)
    sustain_curve = np.ones(sustain_samples)
    release_curve = np.linspace(1, 0, release_samples)
    return np.concatenate([attack_curve, sustain_curve, release_curve])[:length]


def pan_signal(signal: np.ndarray, pan: float) -> np.ndarray:
    left = signal * math.sqrt((1 - pan) * 0.5)
    right = signal * math.sqrt((1 + pan) * 0.5)
    return np.stack([left, right], axis=1)


def add_to_mix(mix: np.ndarray, stereo_signal: np.ndarray, start_index: int) -> None:
    end_index = min(start_index + len(stereo_signal), len(mix))
    mix[start_index:end_index] += stereo_signal[: end_index - start_index]


def one_pole_lowpass(signal: np.ndarray, cutoff_hz: float, sample_rate: int) -> np.ndarray:
    alpha = min(max(cutoff_hz / sample_rate, 0.001), 0.45)
    output = np.zeros_like(signal)
    output[0] = signal[0]
    for index in range(1, len(signal)):
        output[index] = output[index - 1] + alpha * (signal[index] - output[index - 1])
    return output


def shimmer_tone(freq: float, duration: float, sample_rate: int, harmonics: Iterable[float]) -> np.ndarray:
    timeline = np.linspace(0, duration, int(duration * sample_rate), endpoint=False)
    signal = np.zeros_like(timeline)
    for index, harmonic in enumerate(harmonics):
        signal += np.sin(2 * np.pi * freq * harmonic * timeline) * (0.65 / (index + 1))
    return signal


def render_scene_to_wav(scene: SceneSpec, duration_seconds: int) -> bytes:
    sample_rate = 44_100
    total_samples = duration_seconds * sample_rate
    timeline = np.linspace(0, duration_seconds, total_samples, endpoint=False)
    mix = np.zeros((total_samples, 2), dtype=np.float32)
    scale = build_scale(scene, 4)
    chord = build_chord(scene, 3)
    beat_seconds = 60.0 / max(scene.tempo, 1)
    layers = {layer.id: layer for layer in scene.layers}
    randomizer = np.random.default_rng(scene.seed)

    pad_layer = layers.get("pad")
    if pad_layer and pad_layer.enabled:
        pad = np.zeros(total_samples, dtype=np.float32)
        lfo = np.sin(2 * np.pi * 0.08 * timeline) * 0.06
        for freq in chord:
            pad += np.sin(2 * np.pi * (freq + lfo) * timeline)
        pad *= envelope(total_samples, 0.08, 0.24)
        pad *= pad_layer.gain * 0.12
        add_to_mix(mix, pan_signal(pad, pad_layer.pan * scene.controls.stereo_spread), 0)

    pulse_layer = layers.get("pulse")
    if pulse_layer and pulse_layer.enabled:
        step = beat_seconds / 2
        for index in range(int(duration_seconds / step)):
            if randomizer.random() > pulse_layer.density:
                continue
            note = scale[index % len(scale)]
            start = int(index * step * sample_rate)
            note_length = int(step * 0.8 * sample_rate)
            tone = shimmer_tone(note, note_length / sample_rate, sample_rate, [1, 2, 3])
            tone *= envelope(note_length, 0.08, 0.36)
            tone *= pulse_layer.gain * 0.18
            add_to_mix(mix, pan_signal(tone, pulse_layer.pan * scene.controls.stereo_spread), start)

    texture_layer = layers.get("texture")
    if texture_layer and texture_layer.enabled:
        burst = int(beat_seconds * 2.5 * sample_rate)
        for start_beat in np.arange(0, duration_seconds, beat_seconds * 4):
            start = int(start_beat * sample_rate)
            noise = randomizer.normal(0, 1, burst).astype(np.float32)
            noise = one_pole_lowpass(noise, 500 + scene.controls.filter_cutoff * 2200, sample_rate)
            noise *= envelope(burst, 0.3, 0.4)
            noise *= texture_layer.gain * 0.12
            add_to_mix(mix, pan_signal(noise, texture_layer.pan * scene.controls.stereo_spread), start)

    sparkle_layer = layers.get("sparkle")
    if sparkle_layer and sparkle_layer.enabled:
        sparkle_step = beat_seconds / 4
        for index in range(int(duration_seconds / sparkle_step)):
            if randomizer.random() > sparkle_layer.density * 0.6:
                continue
            freq = scale[(index + randomizer.integers(0, 3)) % len(scale)] * 2
            start = int(index * sparkle_step * sample_rate)
            note_length = int(0.16 * sample_rate)
            tone = shimmer_tone(freq, note_length / sample_rate, sample_rate, [1, 2.5, 4])
            tone *= envelope(note_length, 0.04, 0.5)
            tone *= sparkle_layer.gain * 0.12
            add_to_mix(mix, pan_signal(tone, sparkle_layer.pan * scene.controls.stereo_spread), start)

    cutoff = 900 + scene.controls.filter_cutoff * 6000
    mix[:, 0] = one_pole_lowpass(mix[:, 0], cutoff, sample_rate)
    mix[:, 1] = one_pole_lowpass(mix[:, 1], cutoff, sample_rate)

    wet = scene.controls.reverb * 0.35
    delay_samples = int(sample_rate * 0.22)
    if delay_samples < len(mix):
        delayed = np.zeros_like(mix)
        delayed[delay_samples:] = mix[:-delay_samples] * wet
        delayed[delay_samples:, 0] += mix[:-delay_samples, 1] * wet * 0.25
        delayed[delay_samples:, 1] += mix[:-delay_samples, 0] * wet * 0.25
        mix = mix * (1 - wet * 0.35) + delayed

    if Pedalboard is not None:
        board = Pedalboard(
            [
                LowpassFilter(cutoff_frequency_hz=cutoff),
                Reverb(room_size=0.65, wet_level=scene.controls.reverb * 0.22),
                Compressor(threshold_db=-16, ratio=2.2),
                Limiter(threshold_db=-0.6)
            ]
        )
        mix = board(mix, sample_rate)

    peak = float(np.max(np.abs(mix))) or 1.0
    mix = np.clip(mix / peak * 0.88, -1.0, 1.0)

    buffer = io.BytesIO()
    sf.write(buffer, mix, sample_rate, format="WAV", subtype="PCM_16")
    return buffer.getvalue()


def scene_to_json_bytes(scene: SceneSpec) -> bytes:
    return json.dumps(scene.model_dump(by_alias=True), indent=2).encode("utf-8")
