import Link from "next/link";

import { contact, profiles, renders } from "@/config/site";

import { NewsletterSignup } from "./newsletter-signup";

export function SiteFooter({ signup = true }: { signup?: boolean }) {
  return (
    <footer id="contact" className="site-footer">
      {signup && (
        <section
          id="updates"
          className="footer-signup"
          aria-labelledby="updates-title"
        >
          <div className="footer-signup-copy">
            <h2 id="updates-title">Updates</h2>
            <p className="signup-description">
              New releases and occasional news by email.
            </p>
          </div>
          <NewsletterSignup />
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
