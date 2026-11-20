import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { Spread } from "@/components/spread";
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
        <Spread image={{ src: "/assets/kasp/printed/wall-loops.jpg" }} labelledBy="thoughts-title">
          <div>
            <p className="sheet-label">Writing</p>
            <h1 id="thoughts-title" className="sheet-display">
              Thoughts
            </h1>
            <p className="sheet-text">{description}</p>
          </div>
          <div className="sheet-catalogue">
            <h2 className="sheet-label">All posts</h2>
            <ol className="thoughts-list">
              {posts.map((post) => (
                <li key={post.slug} className="thoughts-row">
                  <time dateTime={post.date} className="sheet-meta">
                    {formatThoughtDate(post.date)}
                  </time>
                  <h3 className="thoughts-row-title">
                    <Link href={`/thoughts/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="thoughts-row-text">{post.description}</p>
                </li>
              ))}
            </ol>
            <p className="thoughts-feed">
              <a className="sheet-link" href="/thoughts/rss.xml">
                RSS feed<span aria-hidden="true"> ↗</span>
              </a>
            </p>
          </div>
        </Spread>
      </main>
      <SiteFooter />
    </div>
  );
}
