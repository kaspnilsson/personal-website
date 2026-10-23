"use client";

// Ported from renders.nyc (apps/web/src/components/photo-lookbook.tsx).
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import type { Photograph } from "@/data/photography";

export function PhotoLookbook({ photos }: { photos: readonly Photograph[] }) {
  const track = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(0);
  const count = photos.length;
  const photo = photos[selected];

  function moveTo(index: number) {
    const element = track.current;
    const item = element?.children[index];
    if (!element || !item) return;
    const inset = parseFloat(getComputedStyle(element).scrollPaddingLeft) || 0;
    element.scrollTo({
      left:
        element.scrollLeft +
        item.getBoundingClientRect().left -
        element.getBoundingClientRect().left -
        inset,
    });
  }

  function readPosition() {
    const element = track.current;
    if (!element) return;
    const edge = element.getBoundingClientRect().left;
    const inset = parseFloat(getComputedStyle(element).scrollPaddingLeft) || 0;
    const distances = Array.from(element.children).map((child) =>
      Math.abs(child.getBoundingClientRect().left - edge - inset),
    );
    setActive(distances.indexOf(Math.min(...distances)));
  }

  const position = (index: number) =>
    `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;

  return (
    <section id="images" className="photo-lookbook" aria-labelledby="lookbook-title">
      <div className="lookbook-heading">
        <h2 id="lookbook-title">Images</h2>
        <div className="lookbook-navigation">
          <Link className="quiet-link" href="/about#press">
            Press photos
          </Link>
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {position(active)}
          </span>
          <button
            type="button"
            aria-label="Previous photograph"
            disabled={active === 0}
            onClick={() => moveTo(active - 1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next photograph"
            disabled={active === count - 1}
            onClick={() => moveTo(active + 1)}
          >
            →
          </button>
        </div>
      </div>
      <div
        className="lookbook-track"
        ref={track}
        onScroll={readPosition}
        role="group"
        aria-label="Kasp photographs"
      >
        {photos.map((item, index) => (
          <button
            type="button"
            key={item.src}
            className={`lookbook-frame lookbook-frame--${item.orientation}`}
            aria-label={`Open photograph ${index + 1}: ${item.alt}`}
            onClick={() => {
              setSelected(index);
              dialog.current?.showModal();
            }}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes={
                item.orientation === "landscape"
                  ? "(max-width: 599px) 86vw, 80vw"
                  : "(max-width: 599px) 58vw, 44vw"
              }
            />
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="photo-dialog"
        aria-label="Kasp photographs, full image"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            setSelected(
              (value) =>
                (value + (event.key === "ArrowRight" ? 1 : -1) + count) % count,
            );
          }
        }}
      >
        <div className="photo-dialog-toolbar">
          <p className="site-label" aria-live="polite">
            {position(selected)}
          </p>
          <button
            type="button"
            className="quiet-link"
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
        <div className="photo-dialog-image">
          <Image src={photo.src} alt={photo.alt} fill sizes="100vw" />
        </div>
        <div className="photo-dialog-controls">
          <button
            type="button"
            aria-label="Previous full photograph"
            onClick={() => setSelected((selected - 1 + count) % count)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next full photograph"
            onClick={() => setSelected((selected + 1) % count)}
          >
            →
          </button>
        </div>
      </dialog>
    </section>
  );
}
