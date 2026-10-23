import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { site } from "@/config/site";

import "./globals.css";

// The same Gibson files as renders.nyc. They live in public/fonts so the
// standalone Fieldnotes pages can load them from a stable same-origin URL.
const gibson = localFont({
  src: [
    { path: "../../public/fonts/Gibson-Regular.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Gibson-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-gibson",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "../../public/fonts/JetBrainsMono-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s / ${site.name}` },
  description: site.description,
  openGraph: site.openGraph,
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: [site.openGraph.images[0].url],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${gibson.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
