import Image from "next/image";
import Link from "next/link";

const sections = [
  { id: "music", label: "Music" },
  { id: "images", label: "Images" },
  { id: "updates", label: "Updates" },
];

export function SiteHeader({
  home = false,
  current,
}: {
  home?: boolean;
  current?: "about";
}) {
  return (
    <header className={`site-header ${home ? "site-header--overlay" : ""}`}>
      <Link href="/" className="site-wordmark" aria-label="Kasp home">
        <Image
          src="/assets/kasp/logo/kasp-logo-ink.png"
          alt=""
          width={1127}
          height={581}
          priority
          unoptimized
        />
      </Link>
      <nav aria-label="Main navigation" className="site-navigation">
        {sections.map((section) => (
          <a key={section.id} href={home ? `#${section.id}` : `/#${section.id}`}>
            {section.label}
          </a>
        ))}
        <Link
          href="/about"
          aria-current={current === "about" ? "page" : undefined}
        >
          About
        </Link>
      </nav>
    </header>
  );
}
