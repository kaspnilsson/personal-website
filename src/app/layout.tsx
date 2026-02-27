import type { Metadata } from "next";
import { Anybody, JetBrains_Mono, Darker_Grotesque } from "next/font/google";
import "./globals.css";

const anybody = Anybody({
  subsets: ["latin"],
  variable: "--font-hero",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const darkerGrotesque = Darker_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "kasp — EPK",
  description: "Electronic music producer and DJ — speed garage / UK 2‑step. Press, sets, releases, and booking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anybody.variable} ${jetbrainsMono.variable} ${darkerGrotesque.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
