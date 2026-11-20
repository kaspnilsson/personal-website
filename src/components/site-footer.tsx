import Link from "next/link";

import { contact, profiles, renders } from "@/config/site";

import { InkFilter } from "./ink-filter";
import { NewsletterSignup } from "./newsletter-signup";

export function SiteFooter({
  signup = false,
  photo,
}: {
  signup?: boolean;
  photo?: React.ReactNode;
}) {
  return (
    <footer id="contact" className="site-footer">
      <InkFilter />
      {signup && (
        <section
          id="updates"
          className={`footer-signup${photo ? " footer-signup--photo" : ""}`}
          aria-labelledby="updates-title"
        >
          {photo}
          <h2 id="updates-title" className="footer-word">
            Updates
          </h2>
          <div className="footer-signup-copy">
            <p className="signup-description">
              New releases and occasional news by email.
            </p>
            <NewsletterSignup />
          </div>
        </section>
      )}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Kasp</p>
        <nav aria-label="Contact">
          <a href={`mailto:${contact.email}`}>Bookings</a>
          {[profiles.instagram, profiles.soundcloud, profiles.spotify].map(
            (profile) => (
              <a
                key={profile.label}
                href={profile.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {profile.label}
              </a>
            ),
          )}
        </nav>
        <nav aria-label="More">
          <a href={renders.href} target="_blank" rel="noopener noreferrer">
            {renders.name}
          </a>
          <Link href="/about">About</Link>
        </nav>
      </div>
    </footer>
  );
}
