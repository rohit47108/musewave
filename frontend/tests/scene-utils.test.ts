import { describe, expect, it } from "vitest";

import { buildSceneFromBlend, normalizeBlend } from "@/lib/scene/utils";

describe("scene utils", () => {
  it("normalizes and trims mood blends to three strongest moods", () => {
    const blend = normalizeBlend([
      { mood: "calm", weight: 0.1 },
      { mood: "joyful", weight: 0.4 },
      { mood: "mystical", weight: 0.3 },
      { mood: "focused", weight: 0.2 }
    ]);

    expect(blend).toHaveLength(3);
    expect(blend[0].mood).toBe("joyful");
    expect(blend.reduce((sum, entry) => sum + entry.weight, 0)).toBeCloseTo(1, 2);
  });

  it("builds a deterministic scene from a blend", () => {
    const scene = buildSceneFromBlend(
      [
        { mood: "calm", weight: 0.5 },
        { mood: "mystical", weight: 0.3 },
        { mood: "focused", weight: 0.2 }
      ],
      11
    );

    expect(scene.layers).toHaveLength(4);
    expect(scene.visualProfile.palette.length).toBeGreaterThan(2);
    expect(scene.tempo).toBeGreaterThanOrEqual(70);
  });
});
