import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#050816",
        cyan: "#62f3ff",
        coral: "#ff8678",
        mint: "#7bffc5",
        iris: "#7c8cff"
      },
      fontFamily: {
        display: ["var(--font-syne)"],
        body: ["var(--font-sora)"]
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(98, 243, 255, 0.18), 0 0 80px rgba(98, 243, 255, 0.12)",
        coral: "0 0 60px rgba(255, 134, 120, 0.18)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(98,243,255,0.18), transparent 24%), linear-gradient(135deg, rgba(124,140,255,0.14), rgba(5,8,22,0))"
      }
    }
  },
  plugins: []
};

export default config;
