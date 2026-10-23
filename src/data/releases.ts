// Released music only. Facts and links match Renders data/kasp-releases.json and
// docs/kasp-catalogue.md; each link was checked against the public service.
// Unreleased plans stay out of this file until they have public links.
export type ReleaseLink = { label: string; href: string };

export type Release = {
  id: string;
  title: string;
  kind: "Single";
  date: string;
  label: string;
  cover: { src: string; alt: string };
  links: ReleaseLink[];
};

export type Appearance = {
  title: string;
  credit: string;
  release: string;
  date: string;
  link: ReleaseLink;
};

export const releases: Release[] = [
  {
    id: "kasp-desire-2026",
    title: "Desire",
    kind: "Single",
    date: "2026-10-09",
    label: "kasptrax",
    cover: {
      src: "/assets/kasp/releases/desire-cover.jpg",
      alt: "Desire cover: black photocopied portrait fragments around the word Desire and the kasp logo.",
    },
    links: [
      { label: "Spotify", href: "https://open.spotify.com/track/4DWUA84IslzxaZwSzYroES" },
      { label: "Bandcamp", href: "https://kasptrax.bandcamp.com/album/desire" },
    ],
  },
  {
    id: "kasp-wait-2026",
    title: "Wait",
    kind: "Single",
    date: "2026-08-14",
    label: "Brooklyn Loves Records",
    cover: {
      src: "/assets/kasp/releases/wait-cover.jpg",
      alt: "Wait cover: a figure in a white jacket on a night street, with BK RECS, kasp and wait labels.",
    },
    links: [
      { label: "Spotify", href: "https://open.spotify.com/track/2r2XGIXo1UMIGirlTxpEfK" },
      { label: "Bandcamp", href: "https://kasptrax.bandcamp.com/album/wait" },
    ],
  },
];

export const appearances: Appearance[] = [
  {
    title: "A Hundred Times",
    credit: "Sasha Rome and kasp",
    release: "Every Reason",
    date: "2026-10-16",
    link: { label: "Spotify", href: "https://open.spotify.com/track/368vSQvw8T6ce3hARtAA82" },
  },
];

export const latestRelease = [...releases].sort((a, b) => b.date.localeCompare(a.date))[0];

export function formatReleaseDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
