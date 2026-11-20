"use client";

import { InkFilter } from "@/components/ink-filter";

// Domain-level error page: like the 404, it belongs to no one section of the domain.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="sheet">
      <InkFilter />
      <main id="main-content" className="status-page">
        <p className="sheet-label">Error</p>
        <h1 className="sheet-display">Page unavailable.</h1>
        <div className="sheet-actions">
          <button type="button" className="editorial-link" onClick={reset}>
            <span>Try again</span>
            <span aria-hidden="true">⟶</span>
          </button>
        </div>
      </main>
    </div>
  );
}
