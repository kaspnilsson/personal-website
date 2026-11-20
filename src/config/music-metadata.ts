import type { Metadata } from "next";

import { site } from "./site";

// The music site's identity: its title, sharing card and favicon. Applied by the music pages
// only. The domain itself (404, error) and the blog carry none of it.
export function musicMetadata(page: {
  title?: string;
  description?: string;
  path: string;
}): Metadata {
  const title = page.title ? `${page.title} / ${site.name}` : site.name;
  const description = page.description ?? site.description;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: page.path },
    icons: { icon: "/assets/kasp/icon.png" },
    openGraph: { ...site.openGraph, title, description, url: `${site.url}${page.path === "/" ? "" : page.path}` },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [site.openGraph.images[0].url],
    },
  };
}
