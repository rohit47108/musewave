"use client";

import { useEffect, useState } from "react";

export interface PerformanceTier {
  mounted: boolean;
  reducedMotion: boolean;
  lowPower: boolean;
}

export const usePerformanceTier = (): PerformanceTier => {
  const [tier, setTier] = useState<PerformanceTier>({
    mounted: false,
    reducedMotion: false,
    lowPower: false
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      const memory = "deviceMemory" in navigator ? Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) : 8;
      const isLowPower = memory <= 4 || /iPhone|Android/i.test(navigator.userAgent);

      setTier({
        mounted: true,
        reducedMotion: media.matches,
        lowPower: isLowPower
      });
    };

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return tier;
};
