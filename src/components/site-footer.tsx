import Link from "next/link";

import { contact, profiles, renders } from "@/config/site";

import { NewsletterSignup } from "./newsletter-signup";

// Print wear for display type: the edge is pushed about by toner grain and the solid
// is opened by a few worn patches. The letters stay real text.
function WornFilter() {
  return (
    <svg className="sr-only" aria-hidden="true" focusable="false">
      <filter id="worn" x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="4" result="toner" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="toner"
          scale="4"
          xChannelSelector="R"
          yChannelSelector="G"
          result="edge"
        />
        <feTurbulence type="fractalNoise" baseFrequency="0.035 0.1" numOctaves="3" seed="11" result="wear" />
        <feColorMatrix
          in="wear"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -40 0 0 0 30"
          result="mask"
        />
        <feComposite in="edge" in2="mask" operator="in" />
      </filter>
    </svg>
  );
}

export function SiteFooter({ signup = true }: { signup?: boolean }) {
  return (
    <footer id="contact" className="site-footer">
      <WornFilter />
      {signup && (
        <section
          id="updates"
          className="footer-signup"
          aria-labelledby="updates-title"
        >
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
