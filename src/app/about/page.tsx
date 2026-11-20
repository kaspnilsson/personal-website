import type { Metadata, Viewport } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { Spread } from "@/components/spread";
import { contact, listeningProfiles, profiles, renders, site } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description: `${site.description} Bookings: ${contact.email}.`,
  alternates: { canonical: "/about" },
  openGraph: { ...site.openGraph, title: "About / Kasp", url: `${site.url}/about` },
  twitter: {
    card: "summary_large_image",
    title: "About / Kasp",
    description: site.description,
    images: [site.openGraph.images[0].url],
  },
};

export const viewport: Viewport = { themeColor: "#e4e0d6", colorScheme: "light" };

const followProfiles = [...listeningProfiles, profiles.instagram];

export default function AboutPage() {
  return (
    <div className="sheet">
      <SkipLink />
      <SiteHeader current="about" />
      <main id="main-content" className="about-page">
        <Spread image={{ src: "/assets/kasp/printed/light-trails.jpg" }} labelledBy="about-title">
          <div>
            <p className="sheet-label">About</p>
            <h1 id="about-title" className="sheet-display">
              Kasp
            </h1>
            <p className="sheet-text">{site.description}</p>
            <p className="sheet-text">
              Kasp also runs{" "}
              <a href={renders.href} target="_blank" rel="noopener noreferrer">
                Renders
              </a>
              , a seasonal NYC party series.
            </p>
            <div className="sheet-actions">
              <a className="editorial-link" href={`mailto:${contact.email}`}>
                <span>Email for bookings</span>
                <span aria-hidden="true">⟶</span>
              </a>
              <span className="sheet-meta">{contact.email}</span>
            </div>
          </div>
          <section className="profile-links" aria-labelledby="follow-title">
            <h2 id="follow-title" className="sheet-label">
              Listen and follow
            </h2>
            <ul>
              {followProfiles.map((profile) => (
                <li key={profile.href}>
                  <a href={profile.href} target="_blank" rel="noopener noreferrer">
                    <span>{profile.label}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </Spread>
      </main>
      <SiteFooter />
    </div>
  );
}
