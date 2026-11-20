import { readFileSync } from "node:fs";
import path from "node:path";

import { site } from "@/config/site";
import { thoughtPosts, type ThoughtPost } from "@/content/thoughts/posts";

// Thoughts is its own publication. It shares the domain with the music site and nothing else:
// no music name, logo, sharing image or links.
export const thoughts = {
  name: "Thoughts",
  description: "Posts, newest first.",
  url: `${site.url}/thoughts`,
};

export function getThoughtPosts(): ThoughtPost[] {
  return [...thoughtPosts].sort((a, b) => b.date.localeCompare(a.date));
}

export function getThoughtPost(slug: string): ThoughtPost | undefined {
  return thoughtPosts.find((post) => post.slug === slug);
}

// Bodies are read at build time; every post page is statically generated.
export function getThoughtBody(slug: string): string {
  return readFileSync(
    path.join(process.cwd(), "src/content/thoughts", slug, "body.html"),
    "utf8",
  );
}

export function formatThoughtDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
