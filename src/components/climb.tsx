// Temporary homepage concepts for the council climb. Each is a whole page structure in the
// sheet's language; the winner gets folded back into music.tsx and this file is removed.
import Image from "next/image";

import { contact, listeningProfiles, site } from "@/config/site";
import { appearances, formatReleaseDate, type Release, type ReleaseLink } from "@/data/releases";

function ReleaseDate({ date }: { date: string }) {
  return <time dateTime={date}>{formatReleaseDate(date)}</time>;
}

function Ext({ link, className = "sheet-link", children }: { link: ReleaseLink; className?: string; children?: React.ReactNode }) {
  return (
    <a className={className} href={link.href} target="_blank" rel="noopener noreferrer">
      {children ?? (
        <>
          {link.label}
          <span aria-hidden="true"> ↗</span>
        </>
      )}
    </a>
  );
}

function Listen({ link }: { link: ReleaseLink }) {
  return (
    <Ext link={link} className="editorial-link">
      <span>Listen on {link.label}</span>
      <span aria-hidden="true">⟶</span>
    </Ext>
  );
}

function Follow() {
  return (
    <nav className="sheet-profiles" aria-label="Kasp on music services">
      <span className="sheet-label">Follow</span>
      {listeningProfiles.map((p) => (
        <Ext key={p.href} link={p} />
      ))}
    </nav>
  );
}

function Bookings() {
  return (
    <p className="sheet-meta">
      Bookings{" "}
      <a className="sheet-link" href={`mailto:${contact.email}`}>
        {contact.email}
      </a>
    </p>
  );
}

type Row = { key: string; title: string; meta: React.ReactNode; cover: { src: string; alt: string }; links: ReleaseLink[] };

function rows(releases: readonly Release[]): Row[] {
  return [
    ...releases.map((r) => ({
      key: r.id,
      title: r.title,
      meta: (
        <>
          {r.kind} / <ReleaseDate date={r.date} /> / {r.label}
        </>
      ),
      cover: r.cover,
      links: r.links,
    })),
    ...appearances.map((a) => ({
      key: a.link.href,
      title: a.title,
      meta: (
        <>
          {a.credit} / <ReleaseDate date={a.date} />
        </>
      ),
      cover: a.cover,
      links: [a.link],
    })),
  ];
}

// 1. Poster: the first screen is one poster. Cover crushed against the right edge, the
// release word at full width beneath it, facts and actions hanging off the cover's left edge.
export function PosterHome({ releases }: { releases: readonly Release[] }) {
  const [latest] = releases;
  const [primary, ...secondary] = latest.links;
  const rest = rows(releases).slice(1);
  return (
    <>
      <section id="music" className="cx-poster" aria-labelledby="latest-title">
        <div className="cx-poster-facts">
          <p className="sheet-label">Latest release</p>
          <p className="sheet-meta">
            {latest.kind} / <ReleaseDate date={latest.date} /> / {latest.label}
          </p>
          <div className="sheet-actions">
            <Listen link={primary} />
            {secondary.map((l) => (
              <Ext key={l.href} link={l} />
            ))}
          </div>
          <p className="cx-bio">{site.description}</p>
          <Bookings />
        </div>
        <a href={primary.href} className="cx-poster-cover" target="_blank" rel="noopener noreferrer" aria-label={`Listen to ${latest.title} on ${primary.label}`}>
          <Image src={latest.cover.src} alt={latest.cover.alt} fill priority sizes="62vw" />
        </a>
        <h1 id="latest-title" className="cx-poster-word">
          {latest.title}
        </h1>
      </section>
      <section className="cx-ledger cx-ledger--small" aria-label="More music">
        <h2 className="sheet-label cx-ledger-label">More music</h2>
        {rest.map((r) => (
          <article className="cx-row" key={r.key}>
            <span className="cx-row-cover">
              <Image src={r.cover.src} alt="" fill sizes="160px" />
            </span>
            <h3 className="cx-row-title">{r.title}</h3>
            <p className="sheet-meta">{r.meta}</p>
            <span className="cx-row-links">
              {r.links.map((l) => (
                <Ext key={l.href} link={l} />
              ))}
            </span>
          </article>
        ))}
        <Follow />
      </section>
    </>
  );
}

// 2. Photo first: the mastered photograph is the first screen, edge to edge. The release is a
// paper card hanging off its lower edge, so photograph and release are one piece.
export function PhotoHome({ releases }: { releases: readonly Release[] }) {
  const [latest] = releases;
  const [primary, ...secondary] = latest.links;
  const rest = rows(releases).slice(1);
  return (
    <>
      <section id="music" className="cx-photo" aria-labelledby="latest-title">
        <div className="cx-photo-image" aria-hidden="true">
          <Image src="/assets/kasp/printed/night-wall.jpg" alt="" fill priority sizes="100vw" />
        </div>
        <div className="cx-card">
          <a href={primary.href} className="cx-card-cover" target="_blank" rel="noopener noreferrer" aria-label={`Listen to ${latest.title} on ${primary.label}`}>
            <Image src={latest.cover.src} alt={latest.cover.alt} fill sizes="320px" />
          </a>
          <div className="cx-card-text">
            <p className="sheet-label">Latest release</p>
            <h1 id="latest-title" className="cx-card-title">
              {latest.title}
            </h1>
            <p className="sheet-meta">
              {latest.kind} / <ReleaseDate date={latest.date} /> / {latest.label}
            </p>
            <div className="sheet-actions">
              <Listen link={primary} />
              {secondary.map((l) => (
                <Ext key={l.href} link={l} />
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="cx-ledger cx-ledger--small" aria-label="More music">
        <div className="cx-about">
          <p className="cx-bio">{site.description}</p>
          <Bookings />
        </div>
        <h2 className="sheet-label cx-ledger-label">More music</h2>
        {rest.map((r) => (
          <article className="cx-row" key={r.key}>
            <span className="cx-row-cover">
              <Image src={r.cover.src} alt="" fill sizes="160px" />
            </span>
            <h3 className="cx-row-title">{r.title}</h3>
            <p className="sheet-meta">{r.meta}</p>
            <span className="cx-row-links">
              {r.links.map((l) => (
                <Ext key={l.href} link={l} />
              ))}
            </span>
          </article>
        ))}
        <Follow />
      </section>
    </>
  );
}

// 3. Ledger: no hero. The page is the record catalogue, every release a full-width row with
// its cover and its title at display size; the newest row is the largest.
export function LedgerHome({ releases }: { releases: readonly Release[] }) {
  const all = rows(releases);
  return (
    <section id="music" className="cx-ledger cx-ledger--big" aria-labelledby="ledger-title">
      <div className="cx-ledger-head">
        <h1 id="ledger-title" className="sheet-label">
          Kasp: records
        </h1>
        <p className="cx-bio">{site.description}</p>
        <Bookings />
      </div>
      {all.map((r, i) => (
        <article className={`cx-row${i === 0 ? " cx-row--lead" : ""}`} key={r.key}>
          <span className="cx-row-number sheet-label">{String(i + 1).padStart(2, "0")}</span>
          <span className="cx-row-cover">
            <Image src={r.cover.src} alt={i === 0 ? r.cover.alt : ""} fill priority={i === 0} sizes="(min-width: 900px) 34vw, 100vw" />
          </span>
          <div className="cx-row-body">
            {i === 0 && <p className="sheet-label">Latest release</p>}
            <h2 className="cx-row-title">{r.title}</h2>
            <p className="sheet-meta">{r.meta}</p>
            <div className="sheet-actions">
              {i === 0 ? (
                <>
                  <Listen link={r.links[0]} />
                  {r.links.slice(1).map((l) => (
                    <Ext key={l.href} link={l} />
                  ))}
                </>
              ) : (
                r.links.map((l) => <Ext key={l.href} link={l} />)
              )}
            </div>
          </div>
        </article>
      ))}
      <Follow />
    </section>
  );
}
