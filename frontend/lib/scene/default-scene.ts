import { buildSceneFromBlend } from "@/lib/scene/utils";

export const createDefaultScene = () =>
  buildSceneFromBlend(
    [
      { mood: "calm", weight: 0.55 },
      { mood: "mystical", weight: 0.25 },
      { mood: "focused", weight: 0.2 }
    ],
    7
  );
