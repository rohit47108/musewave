"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Copy, Share2, X } from "lucide-react";

import type { ShareSceneResponse } from "@/lib/scene/types";
import { copyToClipboard } from "@/lib/utils";

interface ShareModalProps {
  open: boolean;
  response?: ShareSceneResponse;
  onClose: () => void;
}

const buildSocialLinks = (response?: ShareSceneResponse) => {
  if (!response) {
    return [];
  }

  const text = encodeURIComponent(`Listen to my MuseWave soundscape: ${response.scene.title}`);
  const url = encodeURIComponent(response.shareUrl);

  return [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${text}&url=${url}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
    { label: "Email", href: `mailto:?subject=MuseWave soundscape&body=${text}%0A${url}` }
  ];
};

export const ShareModal = ({ open, response, onClose }: ShareModalProps) => {
  const embedCode = response
    ? `<iframe src="${response.embedUrl}" width="720" height="480" frameborder="0" allow="autoplay"></iframe>`
    : "";

  const shareNative = async () => {
    if (!response || typeof navigator === "undefined" || !navigator.share) {
      return;
    }

    await navigator.share({
      title: response.scene.title,
      text: response.scene.description,
      url: response.shareUrl
    });
  };

  return (
    <AnimatePresence>
      {open && response ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="relative w-full max-w-2xl rounded-[32px] border border-white/10 bg-[#07101d] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-white/10 p-2 text-white/70 transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="text-xs uppercase tracking-[0.32em] text-cyan/75">Share scene</p>
            <h2 className="mt-3 font-display text-3xl text-white">{response.scene.title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
              Your soundscape now has a public player page, an embed-ready mini experience, and a custom OG image.
            </p>

            <div className="mt-6 grid gap-4">
              <label className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">Public URL</span>
                <div className="flex items-center gap-3">
                  <input
                    readOnly
                    value={response.shareUrl}
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(response.shareUrl)}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75 transition hover:border-cyan/40 hover:text-white"
                  >
                    <Copy className="mr-2 inline h-4 w-4" />
                    Copy
                  </button>
                </div>
              </label>

              <label className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">Embed code</span>
                <div className="flex items-center gap-3">
                  <textarea
                    readOnly
                    value={embedCode}
                    rows={3}
                    className="min-w-0 flex-1 resize-none bg-transparent text-sm text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(embedCode)}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75 transition hover:border-cyan/40 hover:text-white"
                  >
                    <Copy className="mr-2 inline h-4 w-4" />
                    Copy
                  </button>
                </div>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={shareNative}
                className="rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-cyan transition hover:border-cyan/60"
              >
                <Share2 className="mr-2 inline h-4 w-4" />
                Share
              </button>
              {buildSocialLinks(response).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75 transition hover:border-white/25 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
