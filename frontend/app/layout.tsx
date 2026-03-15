import type { Metadata } from "next";
import { Sora, Syne } from "next/font/google";

import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne"
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora"
});

export const metadata: Metadata = {
  title: "MuseWave",
  description: "AI-powered interactive soundscape explorer with immersive visuals and shareable scenes.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${sora.variable} font-body text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
