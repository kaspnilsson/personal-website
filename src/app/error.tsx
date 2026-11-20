"use client";

import Link from "next/link";

import { Spread } from "@/components/spread";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="sheet">
      <main id="main-content">
        <Spread image={{ src: "/assets/kasp/printed/wall-letters.jpg" }} labelledBy="status-title">
          <div>
            <p className="sheet-label">Error</p>
            <h1 id="status-title" className="sheet-display">
              Page unavailable.
            </h1>
            <p className="sheet-text">This page could not load. Try again, or return to the homepage.</p>
            <div className="sheet-actions">
              <button type="button" className="editorial-link" onClick={reset}>
                <span>Try again</span>
                <span aria-hidden="true">⟶</span>
              </button>
              <Link className="sheet-link" href="/">
                Homepage
              </Link>
            </div>
          </div>
        </Spread>
      </main>
    </div>
  );
}
