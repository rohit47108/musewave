"use client";

import Link from "next/link";
import { Headphones, Sparkles } from "lucide-react";

export const Navbar = () => (
  <header className="sticky top-0 z-40 border-b border-white/10 bg-obsidian/70 backdrop-blur-2xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
      <Link href="/" className="group flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan/20 bg-white/5 shadow-glow transition-transform duration-500 group-hover:scale-105">
          <Headphones className="h-5 w-5 text-cyan" />
        </div>
        <div>
          <p className="font-display text-xl tracking-[0.24em] text-white">MuseWave</p>
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">
            Interactive soundscapes for creators
          </p>
        </div>
      </Link>

      <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
        <a href="#studio" className="transition-colors hover:text-white">
          Studio
        </a>
        <a href="#workflow" className="transition-colors hover:text-white">
          Workflow
        </a>
        <a href="#share" className="transition-colors hover:text-white">
          Share
        </a>
      </nav>

      <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 md:flex">
        <Sparkles className="h-4 w-4 text-coral" />
        Live audio + share-ready scenes
      </div>
    </div>
  </header>
);
