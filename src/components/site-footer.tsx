import Link from "next/link";

import { contact, profiles, renders } from "@/config/site";

import { NewsletterSignup } from "./newsletter-signup";

// Photocopied ink, modelled on the Desire cover's own lettering: the shape is softened, a
// fine pixel-level toner noise is added, and the result is re-hardened. That gives a dense
// grain all through the black and slightly feathered edges, the way a copier prints type.
// No discrete pinholes: separate white dots read as holes (and to some people as
// trypophobic); a fine, even grain reads as print.
function inkSteps(blur: number, amp: number, slope: number, intercept: number) {
  return (
    <>
      <feGaussianBlur in="SourceAlpha" stdDeviation={blur} result="soft" />
      <feTurbulence type="fractalNoise" baseFrequency="3" numOctaves="1" seed="3" result="toner" />
      <feColorMatrix in="toner" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="noise" />
      <feComposite in="soft" in2="noise" operator="arithmetic" k1="0" k2="1" k3={amp} k4={-amp / 2} result="grain" />
      <feComponentTransfer in="grain" result="copy">
        <feFuncA type="linear" slope={slope} intercept={intercept} />
      </feComponentTransfer>
      <feFlood floodColor="#121110" result="ink" />
      <feComposite in="ink" in2="copy" operator="in" />
    </>
  );
}

function InkFilter() {
  return (
    <svg className="sr-only" aria-hidden="true" focusable="false">
      <filter id="ink" x="-3%" y="-3%" width="106%" height="106%" colorInterpolationFilters="sRGB">
        {inkSteps(0.5, 1.6, 2.4, -0.9)}
      </filter>
      <filter id="ink-solid" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        {inkSteps(0.5, 1.2, 2.6, -1)}
      </filter>
    </svg>
  );
}

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
