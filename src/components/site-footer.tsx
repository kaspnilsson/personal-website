import Link from "next/link";

import { contact, profiles, renders } from "@/config/site";

import { NewsletterSignup } from "./newsletter-signup";

// Printed ink for display type: toner density varies inside the strokes, the edge is a
// little soft, and a few pinholes open in the solid. Letter shapes stay whole and readable.
function InkFilter() {
  return (
    <svg className="sr-only" aria-hidden="true" focusable="false">
      <filter id="ink" x="-1%" y="-1%" width="102%" height="102%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" result="toner" />
        <feDisplacementMap in="SourceGraphic" in2="toner" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="edge" />
        <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="8" result="field" />
        <feColorMatrix in="field" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.4 0 0 0 0.74" result="density" />
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="21" result="fine" />
        <feColorMatrix in="fine" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -30 0 0 0 21.6" result="pins" />
        <feComposite in="density" in2="pins" operator="in" result="mask" />
        <feComposite in="edge" in2="mask" operator="in" />
      </filter>
      <filter id="ink-solid" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="2" seed="5" result="field" />
        <feColorMatrix in="field" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.4 0 0 0 0.74" result="density" />
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="13" result="fine" />
        <feColorMatrix in="fine" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -40 0 0 0 30.5" result="pins" />
        <feComposite in="density" in2="pins" operator="in" result="mask" />
        <feComposite in="SourceGraphic" in2="mask" operator="in" />
      </filter>
    </svg>
  );
}

export function SiteFooter({
  signup = true,
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
