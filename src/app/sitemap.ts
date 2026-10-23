import type { MetadataRoute } from "next";

import { site } from "@/config/site";

// Public pages only. Private routes are not listed anywhere public.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
