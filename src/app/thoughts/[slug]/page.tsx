import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { site } from "@/config/site";
import {
  formatThoughtDate,
  getThoughtBody,
  getThoughtPost,
  getThoughtPosts,
} from "@/lib/thoughts";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getThoughtPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getThoughtPost(slug);
  if (!post) return {};
  const url = `${site.url}/thoughts/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/thoughts/${post.slug}` },
    openGraph: {
      ...site.openGraph,
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [site.openGraph.images[0].url],
    },
  };
}

export const viewport: Viewport = { themeColor: "#e4e0d6", colorScheme: "light" };

export default async function ThoughtPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getThoughtPost(slug);
  if (!post) notFound();
  const body = getThoughtBody(post.slug);

  return (
    <div className="sheet">
      <SkipLink />
      <SiteHeader current="thoughts" />
      <main id="main-content" className="thought">
        <aside className="thought-rail" aria-label="Post details">
          <p className="sheet-label">
            <Link className="sheet-link" href="/thoughts">
              Thoughts
            </Link>
          </p>
          <p className="sheet-meta">
            <time dateTime={post.date}>{formatThoughtDate(post.date)}</time>
          </p>
          <p className="sheet-meta">{post.readingTime}</p>
        </aside>
        <article className="thought-article" aria-labelledby="thought-title">
          <h1 id="thought-title" className="sheet-display thought-title">
            {post.title}
          </h1>
          {/* Trusted, repo-authored HTML from src/content/thoughts. */}
          <div className="thought-body" dangerouslySetInnerHTML={{ __html: body }} />
          <div className="sheet-actions thought-back">
            <Link href="/thoughts" className="editorial-link">
              <span>All thoughts</span>
              <span aria-hidden="true">⟶</span>
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
