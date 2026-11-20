import type { Metadata, Viewport } from "next";

import { MusicSheet, PhotoBand } from "@/components/music";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { releases } from "@/data/releases";

export const metadata: Metadata = { alternates: { canonical: "/" } };
export const viewport: Viewport = { themeColor: "#e4e0d6", colorScheme: "light" };

const newestFirst = [...releases].sort((a, b) => b.date.localeCompare(a.date));

export default function HomePage() {
  return (
    <div className="sheet">
      <SkipLink />
      <SiteHeader home />
      <main id="main-content" className="home-page">
        <MusicSheet releases={newestFirst} />
        <PhotoBand />
      </main>
      <SiteFooter />
    </div>
  );
}
