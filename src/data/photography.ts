// Kasp promo photographs in public/assets/kasp/promo-shots/selected.
// Dimensions are the files' own; nothing is generated or retouched.
export type Photograph = {
  src: string;
  alt: string;
  width: number;
  height: number;
  orientation: "landscape" | "portrait" | "square";
};

const dir = "/assets/kasp/promo-shots/selected";

export const photographs = {
  lightTrails: {
    src: `${dir}/kasp-editorial-night-light-trails.jpg`,
    alt: "Kasp at night beside a graffiti wall, crossed by long-exposure light trails.",
    width: 1598,
    height: 1598,
    orientation: "square",
  },
  wall: {
    src: `${dir}/kasp-wall-portrait.jpg`,
    alt: "Kasp in a black jacket in front of purple graffiti, looking to the side.",
    width: 1902,
    height: 2400,
    orientation: "portrait",
  },
  nightFront: {
    src: `${dir}/kasp-night-graffiti-front.jpg`,
    alt: "Kasp standing at night in front of a graffiti-covered wall.",
    width: 1480,
    height: 2220,
    orientation: "portrait",
  },
  muralWide: {
    src: `${dir}/kasp-environmental-graffiti-wide.jpg`,
    alt: "Kasp leaning against a grey mural with a LET IT GO speech bubble.",
    width: 2400,
    height: 1600,
    orientation: "landscape",
  },
  muralVertical: {
    src: `${dir}/kasp-environmental-graffiti-vertical.jpg`,
    alt: "Kasp in black against a grey mural, looking to the side.",
    width: 1600,
    height: 2400,
    orientation: "portrait",
  },
  daylightPortrait: {
    src: `${dir}/kasp-secondary-daylight-portrait.jpg`,
    alt: "Kasp in a white T-shirt in front of a rusted chain-link fence.",
    width: 1600,
    height: 2400,
    orientation: "portrait",
  },
  daylightCloseup: {
    src: `${dir}/kasp-secondary-daylight-closeup.jpg`,
    alt: "Kasp in a white T-shirt in front of colorful graffiti.",
    width: 1916,
    height: 2400,
    orientation: "portrait",
  },
  studio: {
    src: `${dir}/kasp-primary-bw-headphones.jpg`,
    alt: "Black-and-white studio portrait of Kasp with headphones around the neck.",
    width: 1600,
    height: 2400,
    orientation: "portrait",
  },
} satisfies Record<string, Photograph>;

// Ends on a landscape frame: the track's end spacing (from renders.nyc) lets a
// landscape last frame scroll fully into place.
export const lookbook: Photograph[] = [
  photographs.nightFront,
  photographs.wall,
  photographs.lightTrails,
  photographs.daylightCloseup,
  photographs.muralVertical,
  photographs.daylightPortrait,
  photographs.studio,
  photographs.muralWide,
];

export const pressPhotos: Photograph[] = [
  photographs.wall,
  photographs.lightTrails,
  photographs.nightFront,
  photographs.muralWide,
  photographs.muralVertical,
  photographs.daylightPortrait,
  photographs.daylightCloseup,
  photographs.studio,
];
