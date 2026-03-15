"use client";

import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { useDeferredValue, useMemo, useRef } from "react";
import type { Mesh, Points } from "three";

import type { AudioMetrics, SceneSpec } from "@/lib/scene/types";

interface SoundscapeCanvasProps {
  scene: SceneSpec;
  metrics: AudioMetrics;
  lowPower?: boolean;
  reducedMotion?: boolean;
  compact?: boolean;
  previewLabel?: string | null;
}

const WaveformOverlay = ({ metrics }: { metrics: AudioMetrics }) => (
  <div className="pointer-events-none absolute inset-x-5 bottom-5 flex h-16 items-end gap-1">
    {metrics.waveform.map((value, index) => (
      <span
        key={`${index}-${value}`}
        className="flex-1 rounded-full bg-white/20"
        style={{
          height: `${12 + Math.abs(value) * 100}%`,
          opacity: 0.16 + Math.abs(value) * 0.6
        }}
      />
    ))}
  </div>
);

const ParticleField = ({ scene, metrics }: { scene: SceneSpec; metrics: AudioMetrics }) => {
  const ref = useRef<Points>(null);
  const positions = useMemo(() => {
    const count = Math.round(900 + scene.visualProfile.particleDensity * 800);
    const data = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const stride = index * 3;
      const radius = 2 + (index / count) * 3.4;
      const angle = index * 0.27 + scene.seed * 0.05;

      data[stride] = Math.cos(angle) * radius * (0.28 + Math.random());
      data[stride + 1] = (Math.random() - 0.5) * 4.6;
      data[stride + 2] = Math.sin(angle) * radius * (0.3 + Math.random());
    }

    return data;
  }, [scene.seed, scene.visualProfile.particleDensity]);

  useFrame((state) => {
    if (!ref.current) {
      return;
    }

    ref.current.rotation.y = state.clock.elapsedTime * (0.05 + metrics.energy * 0.16);
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.14) * 0.18;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={scene.visualProfile.palette[0]}
        size={0.03 + scene.visualProfile.particleDensity * 0.028}
        sizeAttenuation
        transparent
        opacity={0.55 + metrics.treble * 0.2}
      />
    </points>
  );
};

const ReactiveSculpture = ({ scene, metrics }: { scene: SceneSpec; metrics: AudioMetrics }) => {
  const mainRef = useRef<Mesh>(null);
  const accentRef = useRef<Mesh>(null);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    const energy = 1 + metrics.energy * 0.55;

    if (mainRef.current) {
      mainRef.current.rotation.x = elapsed * 0.18;
      mainRef.current.rotation.y = elapsed * (0.14 + scene.visualProfile.motionBias * 0.12);
      mainRef.current.scale.setScalar(energy);
    }

    if (accentRef.current) {
      accentRef.current.rotation.x = -elapsed * 0.12;
      accentRef.current.rotation.z = elapsed * 0.2;
      accentRef.current.position.y = Math.sin(elapsed * 0.8) * 0.32;
    }
  });

  return (
    <>
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh ref={mainRef} position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.55, 18]} />
          <MeshDistortMaterial
            color={scene.visualProfile.palette[0]}
            transparent
            opacity={0.72}
            roughness={0.08}
            metalness={0.24}
            distort={0.4 + metrics.mid * 0.45}
            speed={2 + scene.controls.visualEnergy * 2}
          />
        </mesh>
      </Float>

      <Float speed={1.6} rotationIntensity={0.5} floatIntensity={0.6}>
        <mesh ref={accentRef} position={[1.5, -0.2, -1.4]}>
          <torusKnotGeometry args={[0.5, 0.16, 180, 18]} />
          <meshPhysicalMaterial
            color={scene.visualProfile.palette[1] ?? scene.visualProfile.palette[0]}
            emissive={scene.visualProfile.palette[1] ?? scene.visualProfile.palette[0]}
            emissiveIntensity={0.3 + metrics.treble * 0.8}
            roughness={0.12}
            metalness={0.44}
            clearcoat={1}
            transmission={0.15}
          />
        </mesh>
      </Float>
    </>
  );
};

const SceneLighting = ({ scene, metrics }: { scene: SceneSpec; metrics: AudioMetrics }) => (
  <>
    <color attach="background" args={[scene.visualProfile.gradient[0] ?? "#050816"]} />
    <ambientLight intensity={0.6 + metrics.bass * 0.5} />
    <pointLight
      position={[-3, 2, 3]}
      intensity={3.8 + metrics.energy * 3}
      color={scene.visualProfile.palette[0]}
    />
    <pointLight
      position={[3, -2, 2]}
      intensity={2.4 + metrics.treble * 2.5}
      color={scene.visualProfile.palette[1] ?? scene.visualProfile.palette[0]}
    />
  </>
);

const CanvasFallback = ({
  scene,
  metrics,
  previewLabel
}: Pick<SoundscapeCanvasProps, "scene" | "metrics" | "previewLabel">) => (
  <div
    className="relative h-full min-h-[420px] overflow-hidden rounded-[34px] border border-white/10 bg-black/25"
    style={{
      background: `radial-gradient(circle at 20% 20%, ${scene.visualProfile.palette[0]}33, transparent 32%), radial-gradient(circle at 80% 30%, ${scene.visualProfile.palette[1] ?? scene.visualProfile.palette[0]}22, transparent 24%), linear-gradient(135deg, ${scene.visualProfile.gradient[0]} 0%, ${scene.visualProfile.gradient[1] ?? scene.visualProfile.gradient[0]} 100%)`
    }}
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_38%)]" />
    <div className="absolute left-6 top-6 max-w-sm rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.28em] text-cyan/70">Visual fallback</p>
      <p className="mt-2 text-sm leading-6 text-white/65">
        Smooth ambient gradients stay enabled for lower-power or reduced-motion devices.
      </p>
    </div>
    {previewLabel ? (
      <div className="absolute right-6 top-6 rounded-full border border-coral/20 bg-coral/10 px-4 py-2 text-sm text-coral">
        Hover preview: {previewLabel}
      </div>
    ) : null}
    <div
      className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
      style={{
        background: `radial-gradient(circle, ${scene.visualProfile.palette[0]}88 0%, transparent 64%)`,
        transform: `translate(-50%, -50%) scale(${1 + metrics.energy * 0.35})`
      }}
    />
    <WaveformOverlay metrics={metrics} />
  </div>
);

export const SoundscapeCanvas = ({
  scene,
  metrics,
  lowPower,
  reducedMotion,
  compact,
  previewLabel
}: SoundscapeCanvasProps) => {
  const deferredMetrics = useDeferredValue(metrics);

  if (lowPower || reducedMotion) {
    return <CanvasFallback scene={scene} metrics={deferredMetrics} previewLabel={previewLabel} />;
  }

  return (
    <div className="relative h-full min-h-[440px] overflow-hidden rounded-[34px] border border-white/10 bg-black/25">
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${scene.visualProfile.palette[0]}22, transparent 28%), radial-gradient(circle at 80% 10%, ${scene.visualProfile.palette[1] ?? scene.visualProfile.palette[0]}22, transparent 22%), linear-gradient(135deg, ${scene.visualProfile.gradient[0]} 0%, ${scene.visualProfile.gradient[1] ?? scene.visualProfile.gradient[0]} 100%)`
        }}
      />

      <Canvas camera={{ position: [0, 0, compact ? 5.8 : 6.6], fov: compact ? 48 : 42 }}>
        <SceneLighting scene={scene} metrics={deferredMetrics} />
        <ParticleField scene={scene} metrics={deferredMetrics} />
        <ReactiveSculpture scene={scene} metrics={deferredMetrics} />
        <Sparkles
          count={Math.round(40 + scene.visualProfile.particleDensity * 60)}
          scale={[6, 5, 6]}
          size={2 + scene.visualProfile.bloom * 4}
          speed={0.18 + scene.visualProfile.motionBias}
          noise={scene.visualProfile.noiseScale * 2.6}
          color={scene.visualProfile.palette[2] ?? scene.visualProfile.palette[0]}
        />
        <EffectComposer>
          <Bloom
            mipmapBlur
            intensity={0.4 + scene.visualProfile.bloom * 0.9}
            luminanceThreshold={0.12}
          />
          <Noise opacity={0.045} />
          <Vignette eskil={false} offset={0.18} darkness={0.82} />
        </EffectComposer>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-6 top-6 flex items-start justify-between gap-4">
        <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/55 backdrop-blur-xl">
          {scene.title}
        </div>
        {previewLabel ? (
          <div className="rounded-full border border-coral/20 bg-coral/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-coral">
            Hover preview / {previewLabel}
          </div>
        ) : null}
      </div>

      <WaveformOverlay metrics={deferredMetrics} />
    </div>
  );
};

