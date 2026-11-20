import type { Metadata, Viewport } from "next";

import { PosterHome } from "@/components/climb";
import { PhotoBand } from "@/components/music";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { releases } from "@/data/releases";

// Temporary council concept. Not linked, not indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#e4e0d6", colorScheme: "light" };

const newestFirst = [...releases].sort((a, b) => b.date.localeCompare(a.date));

export default function ConceptPage() {
  return (
    <div className="sheet">
      <SkipLink />
      <SiteHeader home />
      <main id="main-content" className="home-page">
        <PosterHome releases={newestFirst} />
      </main>
      <SiteFooter photo={<PhotoBand />} />
    </div>
  );
}
