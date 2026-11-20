import Image from "next/image";

import { contact, listeningProfiles, site } from "@/config/site";
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

function Arrow() {
  return <span aria-hidden="true"> ↗</span>;
}

// The music as one sheet: the latest cover is the dominant mass, printed into the paper.
// Its column holds everything else, from the latest release on the cover's top edge to the
// rest of the catalogue on its bottom edge, so the first screen is the whole site.
export function MusicSheet({ releases }: { releases: readonly Release[] }) {
  const [latest, ...earlier] = releases;
  const [primary, ...secondary] = latest.links;
  return (
    <section id="music" className="release-sheet" aria-labelledby="latest-title">
      <a
        href={primary.href}
        className="sheet-cover"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Listen to ${latest.title} on ${primary.label}`}
      >
        <Image
          src={latest.cover.src}
          alt={latest.cover.alt}
          fill
          priority
          sizes="(min-width: 900px) 58vw, 100vw"
        />
      </a>
      <div className="sheet-column">
        <div className="sheet-latest">
          <p className="sheet-label">Latest release</p>
          <h1 id="latest-title">{latest.title}</h1>
          <p className="sheet-meta">
            {latest.kind} / <ReleaseDate date={latest.date} /> / {latest.label}
          </p>
          <div className="sheet-actions">
            <ExternalLink link={primary} className="editorial-link">
              <span>Listen on {primary.label}</span>
              <span aria-hidden="true">⟶</span>
            </ExternalLink>
            {secondary.map((link) => (
              <ExternalLink key={link.href} link={link} className="sheet-link">
                {link.label}
                <Arrow />
              </ExternalLink>
            ))}
          </div>
        </div>
        <div className="sheet-about">
          <p>{site.description}</p>
          <p className="sheet-meta">
            Bookings{" "}
            <a className="sheet-link" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          </p>
        </div>
        <div className="sheet-catalogue">
          <h2 className="sheet-label">More music</h2>
          <ul className="sheet-rows">
            {earlier.map((release) => (
              <li className="sheet-row" key={release.id}>
                <span className="sheet-thumb">
                  <Image src={release.cover.src} alt="" fill sizes="48px" />
                </span>
                <span className="sheet-row-text">
                  <span className="sheet-row-title">{release.title}</span>
                  <span className="sheet-meta">
                    {release.kind} / <ReleaseDate date={release.date} /> / {release.label}
                  </span>
                </span>
                <span className="sheet-row-links">
                  {release.links.map((link) => (
                    <ExternalLink key={link.href} link={link} className="sheet-link">
                      {link.label}
                      <Arrow />
                    </ExternalLink>
                  ))}
                </span>
              </li>
            ))}
            {appearances.map((appearance) => (
              <li className="sheet-row sheet-row--text" key={appearance.link.href}>
                <span className="sheet-row-text">
                  <span className="sheet-row-title">{appearance.title}</span>
                  <span className="sheet-meta">
                    {appearance.credit} / <ReleaseDate date={appearance.date} />
                  </span>
                </span>
                <span className="sheet-row-links">
                  <ExternalLink link={appearance.link} className="sheet-link">
                    {appearance.link.label}
                    <Arrow />
                  </ExternalLink>
                </span>
              </li>
            ))}
          </ul>
          <nav className="sheet-profiles" aria-label="Kasp on music services">
            <span className="sheet-label">Follow</span>
            {listeningProfiles.map((profile) => (
              <ExternalLink key={profile.href} link={profile} className="sheet-link">
                {profile.label}
                <Arrow />
              </ExternalLink>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}

// A photograph put through the master bus until it is ink on the same paper.
export function PhotoBand() {
  return (
    <div className="photo-band" aria-hidden="true">
      <Image
        src="/assets/kasp/printed/night-wall.jpg"
        alt=""
        fill
        sizes="100vw"
      />
    </div>
  );
}
