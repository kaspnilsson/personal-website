"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";

import { placeSections, transportation, type Place } from "./guide";

const WIFI_NETWORK = "Bird Up";
const WIFI_PASSWORD = "theworstshowontv";
const KEY_CODE = "0317";

const contents = [
  { id: "key", title: "Key" },
  { id: "couch", title: "Couch" },
  { id: "transportation", title: "Transportation" },
  { id: "laundry", title: "Laundry" },
  { id: "trash", title: "Trash" },
  ...placeSections.map(({ id, title }) => ({ id, title })),
];

export default function CasaGuide() {
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Check if already authenticated in this session
    if (sessionStorage.getItem("casa-authenticated") === "true") {
      setIsAuthenticated(true);
    }
    setReady(true);
  }, []);

  const checkPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordInput === "ilovekasp") {
      setIsAuthenticated(true);
      sessionStorage.setItem("casa-authenticated", "true");
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  if (!ready) return <main className="casa-page" aria-busy="true" />;

  if (!isAuthenticated) {
    return (
      <main className="casa-gate">
        <form className="casa-gate-form" onSubmit={checkPassword}>
          <h1>Casa de Kasper</h1>
          <p className="casa-gate-intro">
            This guide is for guests staying at the apartment. Enter the
            password Kasper sent you.
          </p>
          <label className="site-label" htmlFor="casa-password">
            Password
          </label>
          <input
            id="casa-password"
            className="field-input"
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setShowError(false);
            }}
            aria-describedby={showError ? "casa-password-error" : undefined}
            autoFocus
            required
          />
          <button type="submit" className="editorial-link casa-gate-submit">
            <span>Open the guide</span>
            <span aria-hidden="true">⟶</span>
          </button>
          {showError && (
            <p
              id="casa-password-error"
              className="signup-status signup-status--error"
              role="alert"
            >
              That password did not match. Check the message from Kasper and
              try again.
            </p>
          )}
        </form>
      </main>
    );
  }

  const copyPassword = async () => {
    try {
      // Try modern Clipboard API first (requires HTTPS)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(WIFI_PASSWORD);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      // Fallback for HTTP environments (like localhost)
      const textArea = document.createElement("textarea");
      textArea.value = WIFI_PASSWORD;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      textArea.style.pointerEvents = "none";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        if (document.execCommand("copy")) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch {
        console.log("Fallback copy failed");
      } finally {
        document.body.removeChild(textArea);
      }
    } catch {
      console.log("Failed to copy");
    }
  };

  const joinNetwork = () => {
    // Try to open the wifi URL (works on some mobile devices)
    window.location.href = `wifi:T:WPA;S:${WIFI_NETWORK};P:${WIFI_PASSWORD};;`;
  };

  return (
    <main className="casa-page">
      <header id="top" className="casa-intro">
        <p className="site-label">Guest guide</p>
        <h1>Casa de Kasper</h1>
        <dl className="casa-facts">
          <div>
            <dt>Address</dt>
            <dd>
              <a
                href="https://maps.app.goo.gl/7f54RDcVKnRvQJxp6"
                target="_blank"
                rel="noopener noreferrer"
              >
                250 Moore St #203<span aria-hidden="true"> ↗</span>
              </a>
            </dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              <a href="tel:+14435370317">443-537-0317</a>
            </dd>
          </div>
          <div>
            <dt>Key code</dt>
            <dd className="casa-code">{KEY_CODE}</dd>
          </div>
          <div>
            <dt>Wi-Fi</dt>
            <dd>
              <span className="casa-wifi">
                <span>
                  <span className="casa-wifi-label">Network</span> {WIFI_NETWORK}
                </span>
                <span>
                  <span className="casa-wifi-label">Password</span>{" "}
                  <code>{WIFI_PASSWORD}</code>
                </span>
              </span>
              <span className="casa-actions">
                <button type="button" className="quiet-link" onClick={copyPassword}>
                  {copied ? "Copied" : "Copy password"}
                </button>
                <button type="button" className="quiet-link" onClick={joinNetwork}>
                  Join network
                </button>
              </span>
              <span className="sr-only" role="status">
                {copied ? "Wi-Fi password copied" : ""}
              </span>
            </dd>
          </div>
        </dl>
        <nav className="casa-contents" aria-label="Guide sections">
          <ul>
            {contents.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <GuideSection id="key" title="Key">
        <p className="casa-text">
          The key is in the lockbox shown below. Use code{" "}
          <span className="casa-code">{KEY_CODE}</span>.
        </p>
        <div className="casa-photos">
          <figure>
            <div className="casa-photo">
              <Image
                src="/key_location_far_away.jpg"
                alt="The sidewalk outside the building, with a low iron fence around a street tree near the curb."
                fill
                sizes="(min-width: 900px) 30vw, 50vw"
              />
            </div>
            <figcaption className="site-label">Overview</figcaption>
          </figure>
          <figure>
            <div className="casa-photo">
              <Image
                src="/key_location_closeup.jpg"
                alt="The combination lockbox hanging on the low iron fence around the street tree."
                fill
                sizes="(min-width: 900px) 30vw, 50vw"
              />
            </div>
            <figcaption className="site-label">Close-up</figcaption>
          </figure>
        </div>
      </GuideSection>

      <GuideSection id="couch" title="Couch">
        <p className="casa-text">
          The couch is a Koala Byron sofa bed. It turns into a queen-size bed in
          seconds, with no tools.
        </p>
        <div className="casa-steps">
          <div>
            <h3 className="site-label">Set it up</h3>
            <ol>
              <li>Remove the back cushions and set them aside.</li>
              <li>Pull out the hidden base frame. It slides out smoothly.</li>
              <li>Unfold the mattress so it sits flat on the pull-out frame.</li>
              <li>That&apos;s it: you now have a queen-size bed.</li>
            </ol>
          </div>
          <div>
            <h3 className="site-label">Convert it back</h3>
            <ol>
              <li>Fold the mattress back in half.</li>
              <li>Push the base frame back under the sofa.</li>
              <li>Replace the back cushions.</li>
            </ol>
          </div>
        </div>
        <div className="casa-actions">
          <a
            className="editorial-link"
            href="https://assets.ctfassets.net/uvwd10ivtduz/4JlT1FFXjfjCV9r7lp1XYj/f58ff363c8006b8095efd1984ed5af7c/20240410_Assembly_Instructions_Byron_Sofa_Bed_V2_Digital__1_.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Setup manual (PDF)</span>
            <span aria-hidden="true">↗</span>
          </a>
          <a
            className="quiet-link"
            href="https://www.youtube.com/results?search_query=koala+byron+sofa+bed+setup"
            target="_blank"
            rel="noopener noreferrer"
          >
            Setup videos<span aria-hidden="true"> ↗</span>
          </a>
        </div>
      </GuideSection>

      <GuideSection id="transportation" title="Transportation">
        <PlaceList places={transportation} />
      </GuideSection>

      <GuideSection id="laundry" title="Laundry">
        <ul className="casa-places">
          <li className="casa-place">
            <div className="casa-place-head">
              <h3>Building laundry room</h3>
              <p className="casa-place-address">Basement level of 250 Moore St</p>
            </div>
            <p className="casa-place-hours">24/7 access with building key</p>
            <p className="casa-place-description">
              Washers and dryers run on the Hercules app. Detergent pods are
              provided.
            </p>
            <p className="casa-place-note">In-building, detergent included</p>
          </li>
        </ul>
      </GuideSection>

      <GuideSection id="trash" title="Trash">
        <p className="casa-text">
          Trash and recycling bins are in the back of the building.
        </p>
        <div className="casa-steps">
          <div>
            <h3 className="site-label">How to get there</h3>
            <ol>
              <li>The door to the back is by the entrance, next to the package shelf.</li>
              <li>
                <strong>Bring your keys.</strong> The door locks behind you.
              </li>
              <li>Use the bins in the back area for trash and recycling.</li>
            </ol>
          </div>
        </div>
      </GuideSection>

      {placeSections.map((section) => (
        <GuideSection key={section.id} id={section.id} title={section.title}>
          <PlaceList places={section.places} />
        </GuideSection>
      ))}

      <footer className="casa-footer">
        <a className="quiet-link" href="#top">
          Back to top<span aria-hidden="true"> ↑</span>
        </a>
        <p className="site-label">Casa de Kasper</p>
      </footer>
    </main>
  );
}

function GuideSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="casa-section" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{title}</h2>
      <div className="casa-section-body">{children}</div>
    </section>
  );
}

function PlaceList({ places }: { places: Place[] }) {
  return (
    <ul className="casa-places">
      {places.map((place) => (
        <li key={place.name} className="casa-place">
          <div className="casa-place-head">
            <h3>
              <a href={place.url} target="_blank" rel="noopener noreferrer">
                {place.name}
                <span aria-hidden="true"> ↗</span>
              </a>
            </h3>
            {place.address && (
              <p className="casa-place-address">{place.address}</p>
            )}
          </div>
          {place.hours && <p className="casa-place-hours">{place.hours}</p>}
          <p className="casa-place-description">{place.description}</p>
          {place.specialty && (
            <p className="casa-place-note">{place.specialty}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
