import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { site } from "@/config/site";
import { formatThoughtDate, getThoughtPosts } from "@/lib/thoughts";

const description = "Writing by Kasp.";

export const metadata: Metadata = {
  title: "Thoughts",
  description,
  alternates: {
    canonical: "/thoughts",
    types: { "application/rss+xml": "/thoughts/rss.xml" },
  },
  openGraph: {
    ...site.openGraph,
    title: "Thoughts / Kasp",
    description,
    url: `${site.url}/thoughts`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Thoughts / Kasp",
    description,
    images: [site.openGraph.images[0].url],
  },
};

export const viewport: Viewport = { themeColor: "#e4e0d6", colorScheme: "light" };

export default function ThoughtsPage() {
  const posts = getThoughtPosts();
  return (
    <div className="sheet">
      <SkipLink />
      <SiteHeader current="thoughts" />
      <main id="main-content" className="thoughts-index">
        <h1 className="thoughts-title">Thoughts</h1>
        <ol className="thoughts-list">
          {posts.map((post) => (
            <li key={post.slug} className="thoughts-row">
              <time dateTime={post.date} className="thoughts-date">
                {formatThoughtDate(post.date)}
              </time>
              <div className="thoughts-entry">
                <h2>
                  <Link href={`/thoughts/${post.slug}`}>{post.title}</Link>
                </h2>
                <p>{post.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="thoughts-feed">
          <a href="/thoughts/rss.xml">RSS</a>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
