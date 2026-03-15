import { notFound } from "next/navigation";

import { EmbedPlayer } from "@/components/player/EmbedPlayer";
import { fetchScene } from "@/lib/api/client";

interface EmbedPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ autoplay?: string }>;
}

export default async function EmbedPage({ params, searchParams }: EmbedPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  try {
    const scene = await fetchScene(slug);
    return (
      <main className="min-h-screen bg-[#050816] p-3">
        <EmbedPlayer initialScene={scene} autoplay={query.autoplay === "1"} />
      </main>
    );
  } catch {
    notFound();
  }
}
