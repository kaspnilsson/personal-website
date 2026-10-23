import Image from "next/image";

import type { Photograph } from "@/data/photography";

export function SitePhoto({
  photo,
  priority = false,
  className = "",
  sizes = "100vw",
}: {
  photo: Photograph;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      fill
      priority={priority}
      sizes={sizes}
      className={`site-photo ${className}`}
    />
  );
}
