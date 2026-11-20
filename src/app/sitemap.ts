import type { MetadataRoute } from "next";

import { site } from "@/config/site";
import { getThoughtPosts } from "@/lib/thoughts";

// Public pages only. Private routes are not listed anywhere public.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/thoughts`, changeFrequency: "weekly", priority: 0.7 },
    ...getThoughtPosts().map((post) => ({
      url: `${site.url}/thoughts/${post.slug}`,
      lastModified: post.date,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
