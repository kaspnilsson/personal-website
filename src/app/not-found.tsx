import type { Metadata, Viewport } from "next";

import { InkFilter } from "@/components/ink-filter";

// Domain-level 404. The domain hosts separate things (the music site, the blog), so this page
// belongs to none of them: no header, logo, image or links to either.
export const metadata: Metadata = {
  title: { absolute: "Page not found" },
  robots: { index: false },
};

export const viewport: Viewport = { themeColor: "#e4e0d6", colorScheme: "light" };

export default function NotFound() {
  return (
    <div className="sheet">
      <InkFilter />
      <main id="main-content" className="status-page">
        <p className="sheet-label">404</p>
        <h1 className="sheet-display">Page not found.</h1>
        <p className="sheet-text">This address does not match a page on this domain.</p>
      </main>
    </div>
  );
}
