import Image from "next/image";

// The opening every page shares with the homepage: one printed image crushed against the
// left edge of the sheet, and the page's column on its axes (see .spread in sheet.css).
export function Spread({
  image,
  labelledBy,
  className = "",
  children,
}: {
  image: { src: string; alt?: string };
  labelledBy: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`spread ${className}`} aria-labelledby={labelledBy}>
      <div className="spread-image" aria-hidden={image.alt ? undefined : true}>
        <Image src={image.src} alt={image.alt ?? ""} fill priority sizes="(min-width: 900px) 60vw, 100vw" />
      </div>
      <div className="sheet-column">{children}</div>
    </section>
  );
}
