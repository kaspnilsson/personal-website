// Public identity, contact and profile links. The bio and booking address match
// Kasp's approved account profiles (Renders docs/online-presence.md).
const description =
  "Kasp is a hard house producer and DJ based in Brooklyn, New York.";

export const site = {
  name: "Kasp",
  url: "https://www.kasptrax.com",
  description,
  openGraph: {
    type: "website" as const,
    siteName: "Kasp",
    title: "Kasp",
    description,
    url: "https://www.kasptrax.com",
    images: [
      {
        url: "/assets/kasp/og/kasp-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "Kasp leaning against a grey mural in Brooklyn.",
      },
    ],
  },
};

export const contact = {
  email: "kasper@kasptrax.com",
};

export const renders = {
  name: "Renders",
  description: "Seasonal NYC party series",
  href: "https://www.renders.nyc/",
};

export type Profile = { label: string; href: string };

export const profiles = {
  spotify: {
    label: "Spotify",
    href: "https://open.spotify.com/artist/6jbycDZVRUKXELkQQEq2pm",
  },
  appleMusic: {
    label: "Apple Music",
    href: "https://music.apple.com/us/artist/kasp/1858858797",
  },
  bandcamp: { label: "Bandcamp", href: "https://kasptrax.bandcamp.com/" },
  soundcloud: { label: "SoundCloud", href: "https://soundcloud.com/kasptrax" },
  instagram: { label: "Instagram", href: "https://www.instagram.com/kasptrax/" },
} satisfies Record<string, Profile>;

export const listeningProfiles = [
  profiles.spotify,
  profiles.appleMusic,
  profiles.bandcamp,
  profiles.soundcloud,
];
