import type { Metadata } from "next";

import { ReleaseIndex } from "@/components/music";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { releases } from "@/data/releases";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <>
      <SkipLink />
      <SiteHeader home />
      <main id="main-content" className="home-page">
        <h1 className="sr-only">Kasp</h1>
        <ReleaseIndex
          releases={[...releases].sort((a, b) => b.date.localeCompare(a.date))}
        />
      </main>
      <SiteFooter />
    </>
  );
}
