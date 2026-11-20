import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
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

const followProfiles = [...listeningProfiles, profiles.instagram];

export default function AboutPage() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="about" />
      <main id="main-content" className="about-page">
        <article className="profile-grid" aria-labelledby="about-title">
          <h1 id="about-title">Kasp</h1>
          <div className="profile-copy">
            <p className="profile-bio">{site.description}</p>
            <p className="profile-bio">
              Kasp also runs{" "}
              <a href={renders.href} target="_blank" rel="noopener noreferrer">
                Renders
              </a>
              , a seasonal NYC party series.
            </p>
            <dl className="profile-facts">
              <div>
                <dt>Bookings</dt>
                <dd>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </dd>
              </div>
            </dl>
            <section className="profile-links" aria-labelledby="follow-title">
              <h2 id="follow-title" className="site-label">
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
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
