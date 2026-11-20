import Image from "next/image";

import { listeningProfiles } from "@/config/site";
import {
  appearances,
  formatReleaseDate,
  type Release,
  type ReleaseLink,
} from "@/data/releases";

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

// The latest release as the page's one dominant mass. The cover is printed into the
// paper (multiply), and the facts hang off its edges in small mono, on its axes.
export function ReleaseSheet({ release }: { release: Release }) {
  const [primary, ...secondary] = release.links;
  return (
    <section className="release-sheet" aria-labelledby="latest-title">
      <a
        href={primary.href}
        className="sheet-cover"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Listen to ${release.title} on ${primary.label}`}
      >
        <Image
          src={release.cover.src}
          alt={release.cover.alt}
          fill
          priority
          sizes="(min-width: 900px) 62vw, 100vw"
        />
      </a>
      <div className="sheet-facts sheet-facts--top">
        <p className="site-label">Latest</p>
        <h1 id="latest-title">{release.title}</h1>
        <p className="site-label">
          {release.kind}
          <br />
          <ReleaseDate date={release.date} />
          <br />
          {release.label}
        </p>
      </div>
      <div className="sheet-facts sheet-facts--bottom">
        <ExternalLink link={primary} className="editorial-link">
          <span>Listen on {primary.label}</span>
          <span aria-hidden="true">⟶</span>
        </ExternalLink>
        {secondary.map((link) => (
          <ExternalLink key={link.href} link={link}>
            {link.label}
            <span aria-hidden="true"> ↗</span>
          </ExternalLink>
        ))}
      </div>
    </section>
  );
}

// Everything else as a technical index: small mono only, one row per record.
export function ReleaseIndex({ releases }: { releases: readonly Release[] }) {
  return (
    <section id="music" className="release-index" aria-labelledby="music-title">
      <h2 id="music-title" className="site-label index-title">
        Music
      </h2>
      <ol className="index-rows">
        {releases.map((release, index) => (
          <li className="index-row" key={release.id}>
            <span className="index-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="index-thumb">
              <Image src={release.cover.src} alt="" fill sizes="56px" />
            </span>
            <h3 className="index-name">{release.title}</h3>
            <span className="index-meta">
              {release.kind} / <ReleaseDate date={release.date} /> / {release.label}
            </span>
            <span className="index-links">
              {release.links.map((link) => (
                <ExternalLink key={link.href} link={link}>
                  {link.label}
                  <span aria-hidden="true"> ↗</span>
                </ExternalLink>
              ))}
            </span>
          </li>
        ))}
        {appearances.map((appearance) => (
          <li className="index-row" key={appearance.link.href}>
            <span className="index-number">—</span>
            <span className="index-thumb index-thumb--empty" aria-hidden="true" />
            <h3 className="index-name">{appearance.title}</h3>
            <span className="index-meta">
              {appearance.credit} / {appearance.release} /{" "}
              <ReleaseDate date={appearance.date} />
            </span>
            <span className="index-links">
              <ExternalLink link={appearance.link}>
                {appearance.link.label}
                <span aria-hidden="true"> ↗</span>
              </ExternalLink>
            </span>
          </li>
        ))}
      </ol>
      <nav className="index-profiles" aria-label="Kasp on music services">
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
    </section>
  );
}
