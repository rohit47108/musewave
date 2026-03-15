"use client";

import * as Tone from "tone";

import {
  buildChord,
  buildPulsePattern,
  buildSparklePattern,
  buildScaleNotes
} from "@/lib/audio/music-theory";
import type { AudioMetrics, SceneSpec } from "@/lib/scene/types";

type MetricsCallback = (metrics: AudioMetrics) => void;

export class MuseWaveToneEngine {
  private isInitialized = false;
  private isPlaying = false;
  private scene?: SceneSpec;
  private master?: Tone.Gain;
  private filter?: Tone.Filter;
  private reverb?: Tone.Reverb;
  private limiter?: Tone.Limiter;
  private analyser?: Tone.Analyser;
  private waveform?: Tone.Waveform;
  private loops: Tone.ToneEvent[] = [];
  private metricsTimer?: number;
  private subscribers = new Set<MetricsCallback>();
  private padSynth?: Tone.PolySynth;
  private pulseSynth?: Tone.MonoSynth;
  private textureSynth?: Tone.NoiseSynth;
  private sparkleSynth?: Tone.FMSynth;

  private async ensureInitialized() {
    if (this.isInitialized) {
      return;
    }

    this.master = new Tone.Gain(0.86);
    this.filter = new Tone.Filter(1800, "lowpass");
    this.reverb = new Tone.Reverb({
      decay: 8,
      wet: 0.6,
      preDelay: 0.12
    });
    this.limiter = new Tone.Limiter(-4);
    this.analyser = new Tone.Analyser("fft", 64);
    this.waveform = new Tone.Waveform(64);

    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "sine"
      },
      envelope: {
        attack: 2.6,
        decay: 0.4,
        sustain: 0.85,
        release: 4.8
      }
    });

    this.pulseSynth = new Tone.MonoSynth({
      oscillator: {
        type: "triangle"
      },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.22,
        sustain: 0.16,
        release: 0.6,
        baseFrequency: 240,
        octaves: 2
      },
      envelope: {
        attack: 0.02,
        decay: 0.12,
        sustain: 0.18,
        release: 0.5
      }
    });

    this.textureSynth = new Tone.NoiseSynth({
      noise: {
        type: "pink"
      },
      envelope: {
        attack: 0.8,
        decay: 0.2,
        sustain: 0.24,
        release: 2.5
      }
    });

    this.sparkleSynth = new Tone.FMSynth({
      harmonicity: 2.6,
      modulationIndex: 5,
      envelope: {
        attack: 0.02,
        decay: 0.22,
        sustain: 0.1,
        release: 1.8
      }
    });

    this.padSynth.chain(this.master, this.filter, this.reverb, this.limiter, Tone.Destination);
    this.pulseSynth.chain(this.master, this.filter, this.reverb, this.limiter, Tone.Destination);
    this.textureSynth.chain(this.master, this.filter, this.reverb, this.limiter, Tone.Destination);
    this.sparkleSynth.chain(this.master, this.filter, this.reverb, this.limiter, Tone.Destination);

    this.master.connect(this.analyser);
    this.master.connect(this.waveform);

    this.isInitialized = true;
  }

  private clearLoops() {
    this.loops.forEach((loop) => loop.dispose());
    this.loops = [];
    Tone.Transport.cancel();
  }

  private emitMetrics() {
    if (!this.analyser || !this.waveform) {
      return;
    }

    const spectrum = Array.from(this.analyser.getValue() as Float32Array);
    const waveform = Array.from(this.waveform.getValue() as Float32Array);
    const normalized = spectrum.map((value) => Math.max(0, (Number(value) + 140) / 140));
    const slice = (start: number, end: number) =>
      normalized.slice(start, end).reduce((sum, value) => sum + value, 0) / Math.max(end - start, 1);

    const metrics: AudioMetrics = {
      energy: slice(0, 64),
      bass: slice(0, 8),
      mid: slice(8, 24),
      treble: slice(24, 48),
      waveform: waveform.slice(0, 48).map((value) => Number(value)),
      tick: Tone.Transport.ticks
    };

    this.subscribers.forEach((callback) => callback(metrics));
  }

  private startMetricsLoop() {
    if (this.metricsTimer) {
      window.clearInterval(this.metricsTimer);
    }

    this.metricsTimer = window.setInterval(() => this.emitMetrics(), 100);
  }

  private scheduleScene(scene: SceneSpec) {
    if (!this.padSynth || !this.pulseSynth || !this.textureSynth || !this.sparkleSynth) {
      return;
    }

    this.clearLoops();

    Tone.Transport.bpm.value = scene.tempo;
    this.filter!.frequency.rampTo(600 + scene.controls.filterCutoff * 4200, 0.6);
    this.reverb!.wet.rampTo(scene.controls.reverb, 0.8);
    this.master!.gain.rampTo(scene.controls.masterVolume, 0.5);

    const padChord = buildChord(scene, 3);
    const pulsePattern = buildPulsePattern(scene);
    const sparklePattern = buildSparklePattern(scene);
    const textureNotes = buildScaleNotes(scene, 2);
    const pulseLayer = scene.layers.find((layer) => layer.id === "pulse");
    const sparkleLayer = scene.layers.find((layer) => layer.id === "sparkle");
    const textureLayer = scene.layers.find((layer) => layer.id === "texture");

    const padLoop = new Tone.Loop((time) => {
      if (!scene.layers.find((layer) => layer.id === "pad")?.enabled) {
        return;
      }

      this.padSynth!.triggerAttackRelease(padChord, "2m", time, 0.38 + scene.controls.reverb * 0.2);
    }, "2m").start(0);

    const pulseLoop = new Tone.Sequence(
      (time, note) => {
        if (!note || !pulseLayer?.enabled) {
          return;
        }

        this.pulseSynth!.triggerAttackRelease(String(note), "8n", time, pulseLayer.gain * 0.72);
      },
      pulsePattern,
      "8n"
    ).start(0);

    const textureLoop = new Tone.Loop((time) => {
      if (!textureLayer?.enabled) {
        return;
      }

      this.textureSynth!.triggerAttackRelease("1m", time, textureLayer.gain * 0.4);
      this.padSynth!.triggerAttackRelease(textureNotes.slice(0, 3), "1m", time, 0.18);
    }, "1m").start("0:2");

    const sparkleLoop = new Tone.Sequence(
      (time, note) => {
        if (!sparkleLayer?.enabled) {
          return;
        }

        this.sparkleSynth!.triggerAttackRelease(String(note), "16n", time, sparkleLayer.gain * 0.5);
      },
      sparklePattern,
      "16n"
    ).start("0:1");

    this.loops.push(padLoop, pulseLoop, textureLoop, sparkleLoop);
  }

  async start(scene: SceneSpec) {
    await Tone.start();
    await this.ensureInitialized();
    this.scene = scene;
    this.scheduleScene(scene);
    Tone.Transport.start();
    this.isPlaying = true;
    this.startMetricsLoop();
  }

  async updateScene(scene: SceneSpec) {
    await this.ensureInitialized();
    this.scene = scene;
    this.scheduleScene(scene);

    if (this.isPlaying && Tone.Transport.state !== "started") {
      Tone.Transport.start();
    }
  }

  pause() {
    Tone.Transport.pause();
    this.isPlaying = false;
  }

  resume() {
    Tone.Transport.start();
    this.isPlaying = true;
  }

  stop() {
    Tone.Transport.stop();
    this.isPlaying = false;
    this.clearLoops();

    if (this.metricsTimer) {
      window.clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }
  }

  subscribe(callback: MetricsCallback) {
    this.subscribers.add(callback);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  get playing() {
    return this.isPlaying;
  }
}

export const museWaveToneEngine = new MuseWaveToneEngine();
