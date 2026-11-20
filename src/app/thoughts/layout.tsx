import type { Metadata } from "next";

import { thoughts } from "@/lib/thoughts";

import "./thoughts.css";

// Replace the music site's titles, description and sharing card for everything under /thoughts.
export const metadata: Metadata = {
  title: { absolute: thoughts.name, template: `%s / ${thoughts.name}` },
  description: thoughts.description,
  openGraph: {
    type: "website",
    siteName: thoughts.name,
    title: thoughts.name,
    description: thoughts.description,
    url: thoughts.url,
  },
  twitter: { card: "summary", title: thoughts.name, description: thoughts.description },
};

export default function ThoughtsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
