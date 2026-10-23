import type { MetadataRoute } from "next";

import { site } from "@/config/site";

// No disallow list: naming private paths here would advertise them. Private
// pages carry their own noindex headers and metadata instead.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
