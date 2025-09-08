"use client";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/section-card";
import { socials } from "@/config/socials";

export default function HomePage() {
  return (
    <main className={"font-sans min-h-screen px-4 py-10 sm:px-20 sm:py-16"}>
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <header className="mb-10 sm:mb-14">
          <div className="title-eyebrow">Electronic Music Producer / DJ</div>
          <h1 className="display heading-tight">kasp</h1>
          <div className="title-rule" />
          <div className="text-xs font-mono opacity-70 flex flex-wrap gap-2 mt-3">
            <span className="bg-black/[.05] dark:bg-white/[.06] px-2 py-1 rounded">Speed Garage</span>
            <span className="bg-black/[.05] dark:bg-white/[.06] px-2 py-1 rounded">UK 2‑Step</span>
            <span className="bg-black/[.05] dark:bg-white/[.06] px-2 py-1 rounded">Club</span>
          </div>

          <div className="flex flex-wrap gap-2.5 mt-6">
            <Button asChild>
              <a href={socialLink("soundcloud")} target="_blank" rel="noreferrer noopener">
                Listen — SoundCloud
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={socialLink("youtube")} target="_blank" rel="noreferrer noopener">
                Watch Sets — YouTube
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="mailto:booking@kasp.fm">Bookings</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#" aria-disabled>
                Download Press Kit
              </a>
            </Button>
          </div>
        </header>

        <div className="flex flex-col gap-8 sm:gap-10">
          {/* Gallery */}
          <SectionCard title="Gallery">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Replace src with local images when ready */}
                <GalleryImage src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1400&auto=format&fit=crop" alt="kasp performing — crowd" />
                <GalleryImage src="https://images.unsplash.com/photo-1598387325339-0043bb73e4f9?q=80&w=1400&auto=format&fit=crop" alt="kasp — decks closeup" />
                <GalleryImage src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1400&auto=format&fit=crop" alt="kasp — lights" />
                <GalleryImage src="https://images.unsplash.com/photo-1514369118554-e20d93546b30?q=80&w=1400&auto=format&fit=crop" alt="kasp — stage" />
                <GalleryImage src="https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?q=80&w=1400&auto=format&fit=crop" alt="kasp — club" />
                <GalleryImage src="https://images.unsplash.com/photo-1514369118554-e20d93546b30?q=80&w=1400&auto=format&fit=crop" alt="kasp — detail" />
            </div>
          </SectionCard>

          {/* About / Highlights */}
          <SectionCard title="About">
            <div className="grid sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2 text-sm/6 opacity-90">
                  Brooklyn-based producer and DJ shaping a modern take on speed garage and UK 2‑step: swung drums, ghosted vocals, and low‑end that moves a room. Built for sweatbox clubs and sunrise roofs alike.
                </div>
                <ul className="text-sm/6 opacity-90 space-y-2">
                  <li><span className="font-mono text-xs opacity-70 mr-2">Focus</span> Speed Garage / UK 2‑Step</li>
                  <li><span className="font-mono text-xs opacity-70 mr-2">Origin</span> Brooklyn, NY</li>
                  <li><span className="font-mono text-xs opacity-70 mr-2">BPM</span> 132–138</li>
                </ul>
            </div>
          </SectionCard>

          {/* Support Credits */}
          <SectionCard title="Support Credits">
            <div className="flex flex-wrap gap-2 sm:gap-3">
                {[
                  "Interplanetary Criminal",
                  "Sammy Virji",
                  "Conducta",
                  "Skin On Skin",
                  "Eliza Rose",
                  "KETTAMA",
                  "Mall Grab",
                  "Yung Singh",
                ].map((name) => (
                  <span key={name} className="text-xs font-mono opacity-80 bg-black/[.05] dark:bg-white/[.06] px-2 py-1 rounded">
                    {name}
                  </span>
                ))}
            </div>
          </SectionCard>

          {/* Featured Sets */}
          <SectionCard title="Featured Sets">
            <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                <SetItem
                  title="Boiler Room — Bushwick Warehouse"
                  meta="75 min · Speed Garage / 2‑Step"
                  url="https://youtube.com"
                />
                <SetItem
                  title="NTS Guest Mix — Late Night"
                  meta="60 min · Swung rollers"
                  url="https://www.nts.live/"
                />
                <SetItem
                  title="Rinse FM Residency — Vol. 1"
                  meta="58 min · UKG pressure"
                  url="https://rinse.fm/"
                />
                <SetItem
                  title="Warehouse Afterhours — Live"
                  meta="92 min · Dark garage"
                  url="https://soundcloud.com"
                />
            </div>
          </SectionCard>

          {/* Releases */}
          <SectionCard title="Releases">
            <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                <ReleaseItem
                  title="Midnight MOTION — EP"
                  meta="4 tracks · 2025"
                  url="https://bandcamp.com"
                />
                <ReleaseItem
                  title="Hold Tight (VIP)"
                  meta="Single · 2024"
                  url="https://open.spotify.com"
                />
                <ReleaseItem
                  title="Ghost Vox Dub"
                  meta="Single · 2024"
                  url="https://soundcloud.com"
                />
                <ReleaseItem
                  title="Basement Swing"
                  meta="Single · 2023"
                  url="https://soundcloud.com"
                />
            </div>
          </SectionCard>

          {/* Contact / Socials */}
          <SectionCard title="Contact">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm/6 opacity-90">
                For bookings, press, and promo: <a className="link" href="mailto:booking@kasp.fm">booking@kasp.fm</a>
              </div>
              <div className="flex flex-wrap gap-3">
                  <a className="link text-sm/6" href={socialLink("instagram")} target="_blank" rel="noreferrer noopener">Instagram →</a>
                  <a className="link text-sm/6" href={socialLink("soundcloud")} target="_blank" rel="noreferrer noopener">SoundCloud →</a>
                  <a className="link text-sm/6" href={socialLink("spotify")} target="_blank" rel="noreferrer noopener">Spotify →</a>
                  <a className="link text-sm/6" href={socialLink("youtube")} target="_blank" rel="noreferrer noopener">YouTube →</a>
              </div>
            </div>
            {!!(socials.aliases && socials.aliases.length) && (
              <div className="mt-4 text-xs font-mono opacity-70 flex flex-wrap gap-2">
                {socials.aliases!.map((alias) => (
                  <span key={alias} className="bg-black/[.05] dark:bg-white/[.06] px-2 py-1 rounded">{alias}</span>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}

function GalleryImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-40 sm:h-44 object-cover rounded-lg"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}

type Platform = "instagram" | "soundcloud" | "spotify" | "youtube" | "bandcamp";
function socialLink(platform: Platform) {
  switch (platform) {
    case "instagram":
      return socials.instagram ? `https://instagram.com/${socials.instagram}` : "https://instagram.com";
    case "soundcloud":
      return socials.soundcloud ? `https://soundcloud.com/${socials.soundcloud}` : "https://soundcloud.com";
    case "spotify":
      return socials.spotify || "https://open.spotify.com";
    case "youtube":
      // Supports @handle or full URL
      return socials.youtube
        ? socials.youtube.startsWith("http")
          ? socials.youtube
          : `https://youtube.com/${socials.youtube.startsWith("@") ? socials.youtube : `@${socials.youtube}`}`
        : "https://youtube.com";
    case "bandcamp":
      return socials.bandcamp ? `https://${socials.bandcamp}.bandcamp.com` : "https://bandcamp.com";
    default:
      return "#";
  }
}

function SetItem({ title, meta, url }: { title: string; meta: string; url: string }) {
  return (
    <div className="border-b border-black/[.08] dark:border-white/[.145] pb-4 last:border-b-0">
      <div className="flex flex-col gap-2.5">
        <a className="font-medium text-sm link" href={url} target="_blank" rel="noreferrer noopener">
          {title} →
        </a>
        <div className="text-xs opacity-70 font-mono">{meta}</div>
      </div>
    </div>
  );
}

function ReleaseItem({ title, meta, url }: { title: string; meta: string; url: string }) {
  return (
    <div className="border-b border-black/[.08] dark:border-white/[.145] pb-4 last:border-b-0">
      <div className="flex flex-col gap-2.5">
        <a className="font-medium text-sm link" href={url} target="_blank" rel="noreferrer noopener">
          {title} →
        </a>
        <div className="text-xs opacity-70 font-mono">{meta}</div>
      </div>
    </div>
  );
}
