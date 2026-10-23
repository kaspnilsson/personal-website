import type { Metadata } from "next";
import Image from "next/image";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { contact, listeningProfiles, profiles, renders, site } from "@/config/site";
import { photographs, pressPhotos } from "@/data/photography";

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

function fileName(src: string) {
  return src.split("/").at(-1) ?? src;
}

export default function AboutPage() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="about" />
      <main id="main-content" className="about-page">
        <article className="profile-grid" aria-labelledby="about-title">
          <figure className="profile-photo">
            <Image
              src={photographs.wall.src}
              alt={photographs.wall.alt}
              fill
              priority
              sizes="(min-width: 900px) 50vw, 100vw"
              className="site-photo"
            />
          </figure>
          <div className="profile-copy">
            <h1 id="about-title">Kasp</h1>
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
              <div>
                <dt>Based in</dt>
                <dd>Brooklyn, New York</dd>
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
        <section id="press" className="press-photos" aria-labelledby="press-title">
          <div className="press-heading">
            <h2 id="press-title">Press photos</h2>
            <p className="site-label">{pressPhotos.length} photographs / JPG</p>
          </div>
          <ul className="press-grid">
            {pressPhotos.map((photo) => (
              <li key={photo.src} className="press-photo">
                <div className={`press-frame press-frame--${photo.orientation}`}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 900px) 25vw, (min-width: 600px) 45vw, 100vw"
                  />
                </div>
                <div className="press-caption">
                  <span>
                    {photo.width} × {photo.height}
                  </span>
                  <a
                    href={photo.src}
                    download={fileName(photo.src)}
                    aria-label={`Download ${photo.alt} (JPG, ${photo.width} by ${photo.height} pixels)`}
                  >
                    Download<span aria-hidden="true"> ↓</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
