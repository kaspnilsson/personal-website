import { ReleaseHero, ReleaseIndex } from "@/components/music";
import { PhotoLookbook } from "@/components/photo-lookbook";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { lookbook } from "@/data/photography";
import { latestRelease, releases } from "@/data/releases";

export default function HomePage() {
  return (
    <>
      <SkipLink />
      <SiteHeader home />
      <main id="main-content" className="home-page">
        <ReleaseHero release={latestRelease} />
        <ReleaseIndex releases={releases} />
        <PhotoLookbook photos={lookbook} />
      </main>
      <SiteFooter />
    </>
  );
}
