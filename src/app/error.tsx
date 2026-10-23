"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main-content" className="status-page">
      <h1>Page unavailable.</h1>
      <p>This page could not load. Try again, or return to the homepage.</p>
      <div className="hero-actions">
        <button type="button" className="editorial-link" onClick={reset}>
          <span>Try again</span>
          <span aria-hidden="true">⟶</span>
        </button>
        <Link className="quiet-link" href="/">
          Homepage
        </Link>
      </div>
    </main>
  );
}
