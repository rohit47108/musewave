import { MuseWaveEditor } from "@/components/editor/MuseWaveEditor";
import { Navbar } from "@/components/ui/Navbar";

const featureCards = [
  {
    title: "Mood-driven composition",
    body: "Blend calm, reflective, mystical, focused, and more into a deterministic scene model that stays remixable."
  },
  {
    title: "Reactive visual field",
    body: "Three.js particle clouds, sculptural meshes, and neon gradients respond to analyser energy in real time."
  },
  {
    title: "Share and embed",
    body: "Generate public player URLs, embeds, and OG artwork so each scene can be reopened and shared instantly."
  }
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="pb-24">
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-10 md:px-8 md:pt-16">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-cyan/20 bg-cyan/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-cyan">
                Award-caliber audiovisual studio
              </span>
              <div className="space-y-4">
                <h1 className="max-w-4xl font-display text-5xl leading-none text-white md:text-7xl">
                  Build immersive soundscapes with a live canvas that listens back.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-white/65 md:text-lg">
                  MuseWave combines AI-shaped mood composition, live browser audio synthesis, and luminous WebGL visuals into a single interactive studio for artists, musicians, and educators.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#studio"
                  className="rounded-full border border-cyan/30 bg-cyan/10 px-6 py-3 text-sm uppercase tracking-[0.24em] text-cyan transition hover:border-cyan/60"
                >
                  Launch studio
                </a>
                <a
                  href="#workflow"
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm uppercase tracking-[0.24em] text-white/75 transition hover:border-white/20 hover:text-white"
                >
                  See workflow
                </a>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.28em] text-white/40">Core system</p>
                <p className="mt-3 font-display text-3xl text-white">Hybrid audio + share API</p>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  Tone.js powers instant in-browser iteration while FastAPI stores canonical scenes for public playback and embeds.
                </p>
              </div>
              <div className="rounded-[30px] border border-coral/20 bg-coral/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-coral">Visual language</p>
                <p className="mt-3 font-display text-3xl text-white">Obsidian, cyan, coral, mint</p>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  A gallery-like dark UI with neon accents, blurred panels, and high-contrast motion cues.
                </p>
              </div>
              <div className="rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.28em] text-white/40">Launch surface</p>
                <p className="mt-3 font-display text-3xl text-white">Share pages and embeds</p>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  Saved scenes reopen with the same composition logic and generated OG metadata for social previews.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 md:px-8">
          <MuseWaveEditor />
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-5 md:px-8" id="workflow">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-mint/80">Workflow</p>
              <h2 className="mt-2 font-display text-4xl text-white">From mood intent to public scene</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/60">
              The frontend keeps editing immediate. The backend canonicalizes scenes, stores slugs, and turns them into shareable public artifacts.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
              >
                <h3 className="font-display text-2xl text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/60">{card.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
