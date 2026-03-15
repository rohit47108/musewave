import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicPlayer } from "@/components/player/PublicPlayer";
import { Navbar } from "@/components/ui/Navbar";
import { fetchScene } from "@/lib/api/client";

interface SoundscapePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SoundscapePageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const scene = await fetchScene(slug);
    return {
      title: `${scene.scene.title} | MuseWave`,
      description: scene.scene.description,
      openGraph: {
        title: scene.scene.title,
        description: scene.scene.description,
        images: [scene.ogImageUrl]
      }
    };
  } catch {
    return {
      title: "MuseWave Scene"
    };
  }
}

export default async function SoundscapePage({ params }: SoundscapePageProps) {
  const { slug } = await params;

  try {
    const scene = await fetchScene(slug);

    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 md:px-8">
          <PublicPlayer initialScene={scene} />
        </main>
      </>
    );
  } catch {
    notFound();
  }
}
