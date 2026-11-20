import type { Metadata, Viewport } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { Spread } from "@/components/spread";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export const viewport: Viewport = { themeColor: "#e4e0d6", colorScheme: "light" };

export default function NotFound() {
  return (
    <div className="sheet">
      <SkipLink />
      <SiteHeader />
      <main id="main-content">
        <Spread image={{ src: "/assets/kasp/printed/wall-letters.jpg" }} labelledBy="status-title">
          <div>
            <p className="sheet-label">404</p>
            <h1 id="status-title" className="sheet-display">
              Page not found.
            </h1>
            <p className="sheet-text">This address does not match a page on kasptrax.com.</p>
            <div className="sheet-actions">
              <Link href="/" className="editorial-link">
                <span>Go to the homepage</span>
                <span aria-hidden="true">⟶</span>
              </Link>
            </div>
          </div>
        </Spread>
      </main>
      <SiteFooter />
    </div>
  );
}
