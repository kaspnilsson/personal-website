import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { SkipLink } from "@/components/skip-link";
import { ThoughtsFooter, ThoughtsHeader } from "@/components/thoughts-chrome";
import { formatThoughtDate, getThoughtPosts, thoughts } from "@/lib/thoughts";

export const metadata: Metadata = {
  title: { absolute: thoughts.name },
  alternates: {
    canonical: "/thoughts",
    types: { "application/rss+xml": "/thoughts/rss.xml" },
  },
};

export const viewport: Viewport = { themeColor: "#e4e0d6", colorScheme: "light" };

export default function ThoughtsPage() {
  const posts = getThoughtPosts();
  return (
    <div className="sheet">
      <SkipLink />
      <ThoughtsHeader wordmark={false} />
      <main id="main-content" className="thoughts-index" aria-labelledby="thoughts-title">
        <h1 id="thoughts-title" className="sheet-display thoughts-title">
          Thoughts
        </h1>
        <ol className="thoughts-list">
          {posts.map((post) => (
            <li key={post.slug} className="thoughts-row">
              <time dateTime={post.date} className="sheet-meta thoughts-date">
                {formatThoughtDate(post.date)}
              </time>
              <div className="thoughts-entry">
                <h2 className="thoughts-row-title">
                  <Link href={`/thoughts/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="thoughts-row-text">{post.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </main>
      <ThoughtsFooter />
    </div>
  );
}
