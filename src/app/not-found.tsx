import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main-content" className="status-page">
        <h1>Page not found.</h1>
        <p>This address does not match a page on kasptrax.com.</p>
        <Link href="/" className="editorial-link">
          <span>Go to the homepage</span>
          <span aria-hidden="true">⟶</span>
        </Link>
      </main>
      <SiteFooter signup={false} />
    </>
  );
}
