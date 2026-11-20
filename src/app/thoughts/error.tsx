"use client";

import Link from "next/link";

import { ThoughtsHeader } from "@/components/thoughts-chrome";

export default function ThoughtError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="sheet">
      <ThoughtsHeader />
      <main id="main-content" className="thoughts-index" aria-labelledby="status-title">
        <p className="sheet-label">Error</p>
        <h1 id="status-title" className="sheet-display thoughts-title">
          Page unavailable.
        </h1>
        <div className="sheet-actions">
          <button type="button" className="editorial-link" onClick={reset}>
            <span>Try again</span>
            <span aria-hidden="true">⟶</span>
          </button>
          <Link className="sheet-link" href="/thoughts">
            All posts
          </Link>
        </div>
      </main>
    </div>
  );
}
