export type Socials = {
  instagram?: string;
  soundcloud?: string;
  spotify?: string; // full URL or artist ID URL
  youtube?: string; // channel/user handle or full URL
  bandcamp?: string; // handle only (e.g., kasp -> https://kasp.bandcamp.com)
  aliases?: string[];
};

// Fill these with your actual handles; leave blank to hide.
export const socials: Socials = {
  // instagram: "kasp",
  // soundcloud: "kasptrax",
  // spotify: "https://open.spotify.com/artist/XXXXXXXX",
  // youtube: "@kasp", // or full URL
  // bandcamp: "kasptrax", // becomes https://kasptrax.bandcamp.com
  aliases: ["stripess", "stripessmusic"],
};

