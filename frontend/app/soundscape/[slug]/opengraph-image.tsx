import { ImageResponse } from "next/og";

import { fetchScene } from "@/lib/api/client";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

interface OpenGraphProps {
  params: Promise<{ slug: string }>;
}

export default async function OpenGraphImage({ params }: OpenGraphProps) {
  const { slug } = await params;
  const response = await fetchScene(slug);
  const scene = response.scene;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: `linear-gradient(135deg, ${scene.visualProfile.gradient[0]} 0%, ${scene.visualProfile.gradient[1] ?? scene.visualProfile.gradient[0]} 100%)`,
          color: "white",
          padding: "56px",
          fontFamily: "sans-serif"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 20% 20%, ${scene.visualProfile.palette[0]}55, transparent 24%), radial-gradient(circle at 80% 30%, ${scene.visualProfile.palette[1] ?? scene.visualProfile.palette[0]}44, transparent 22%)`
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px)",
            borderRadius: 32,
            padding: 40,
            width: "100%"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 700 }}>
              <span style={{ fontSize: 20, letterSpacing: 6, textTransform: "uppercase", color: "#62f3ff" }}>
                MuseWave soundscape
              </span>
              <h1 style={{ margin: 0, fontSize: 68, lineHeight: 1 }}>{scene.title}</h1>
              <p style={{ margin: 0, fontSize: 28, lineHeight: 1.4, color: "rgba(255,255,255,0.72)" }}>
                {scene.description}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 18px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.18)",
                fontSize: 22
              }}
            >
              <span>{scene.key}</span>
              <span>{scene.scale}</span>
              <span>{scene.tempo} BPM</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            {scene.moodBlend.map((entry) => (
              <span
                key={entry.mood}
                style={{
                  borderRadius: 999,
                  padding: "14px 18px",
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(5,8,22,0.3)",
                  fontSize: 22
                }}
              >
                {entry.mood} {Math.round(entry.weight * 100)}%
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
