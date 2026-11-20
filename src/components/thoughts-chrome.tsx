import Link from "next/link";

import { InkFilter } from "./ink-filter";

// The blog's own header and footer. Thoughts is a separate publication that happens to share
// the domain with the music site: nothing here links to the music pages, the kasp logo or
// any music profile, and nothing on the music site links here.
// On the index the page title already says Thoughts, so the wordmark is left out there.
export function ThoughtsHeader({ wordmark = true }: { wordmark?: boolean }) {
  return (
    <header className="site-header thoughts-header">
      {wordmark ? (
        <Link href="/thoughts" className="thoughts-wordmark">
          Thoughts
        </Link>
      ) : (
        <span />
      )}
      <nav aria-label="Thoughts" className="site-navigation">
        <a href="/thoughts/rss.xml">RSS</a>
      </nav>
    </header>
  );
}

export function ThoughtsFooter() {
  return (
    <footer className="site-footer">
      <InkFilter />
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()}</p>
        <nav aria-label="Thoughts">
          <Link href="/thoughts">All posts</Link>
          <a href="/thoughts/rss.xml">RSS</a>
        </nav>
      </div>
    </footer>
  );
}
