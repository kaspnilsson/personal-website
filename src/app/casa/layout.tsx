import type { Metadata } from "next";

// Private guest guide: keep it out of search results and link previews.
export const metadata: Metadata = {
  title: { absolute: "Casa de Kasper" },
  description: "Guest guide.",
  robots: { index: false, follow: false },
  openGraph: null,
  twitter: null,
};

export default function CasaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
