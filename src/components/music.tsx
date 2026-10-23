import Image from "next/image";

import { listeningProfiles } from "@/config/site";
import { photographs } from "@/data/photography";
import {
  appearances,
  formatReleaseDate,
  type Release,
  type ReleaseLink,
} from "@/data/releases";

import { SitePhoto } from "./site-photo";

function ReleaseDate({ date }: { date: string }) {
  return <time dateTime={date}>{formatReleaseDate(date)}</time>;
}

function ExternalLink({
  link,
  className = "quiet-link",
  children,
}: {
  link: ReleaseLink;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <a className={className} href={link.href} target="_blank" rel="noopener noreferrer">
      {children ?? link.label}
    </a>
  );
}

export function ReleaseHero({ release }: { release: Release }) {
  const [primary, ...secondary] = release.links;
  return (
    <section className="release-hero" aria-labelledby="latest-title">
      <SitePhoto photo={photographs.lightTrails} priority />
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-copy">
        <h1 id="latest-title">{release.title}</h1>
        <div className="hero-facts">
          <p>
            {release.kind}
            <span className="fact-divider">/</span>
            <ReleaseDate date={release.date} />
          </p>
        </div>
        <div className="hero-actions">
          <ExternalLink link={primary} className="editorial-link">
            <span>Listen on {primary.label}</span>
            <span aria-hidden="true">⟶</span>
          </ExternalLink>
          {secondary.map((link) => (
            <ExternalLink key={link.href} link={link} />
          ))}
        </div>
      </div>
      <a className="hero-next site-label" href="#music">
        Music<span aria-hidden="true">↓</span>
      </a>
    </section>
  );
}

export function ReleaseIndex({ releases }: { releases: readonly Release[] }) {
  return (
    <section id="music" className="release-index" aria-labelledby="music-title">
      <h2 id="music-title" className="sr-only">
        Music
      </h2>
      <div className="release-grid">
        {releases.map((release) => {
          const [primary] = release.links;
          return (
            <article className="release-card" key={release.id}>
              <a
                href={primary.href}
                className="release-art"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Listen to ${release.title} on ${primary.label}`}
              >
                <Image
                  src={release.cover.src}
                  alt={release.cover.alt}
                  fill
                  sizes="(min-width: 600px) 45vw, 100vw"
                />
              </a>
              <div className="release-caption">
                <h3>{release.title}</h3>
                <p className="site-label">
                  {release.kind} / <ReleaseDate date={release.date} /> /{" "}
                  {release.label}
                </p>
                <ul className="release-links" aria-label={`${release.title} links`}>
                  {release.links.map((link) => (
                    <li key={link.href}>
                      <ExternalLink link={link}>
                        {link.label}
                        <span aria-hidden="true"> ↗</span>
                      </ExternalLink>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
      <div className="release-more">
        {appearances.map((appearance) => (
          <article className="release-record" key={appearance.link.href}>
            <div>
              <h3>{appearance.title}</h3>
              <p>
                {appearance.credit} / {appearance.release} /{" "}
                <ReleaseDate date={appearance.date} />
              </p>
            </div>
            <ExternalLink link={appearance.link} className="editorial-link">
              <span>{appearance.link.label}</span>
              <span aria-hidden="true">↗</span>
            </ExternalLink>
          </article>
        ))}
        <nav className="profile-row" aria-label="Kasp on music services">
          <p className="site-label">All music</p>
          <ul>
            {listeningProfiles.map((profile) => (
              <li key={profile.href}>
                <ExternalLink link={profile}>
                  {profile.label}
                  <span aria-hidden="true"> ↗</span>
                </ExternalLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
