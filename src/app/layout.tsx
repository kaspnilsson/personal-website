import type { Metadata } from "next";
import { Anybody, Darker_Grotesque, JetBrains_Mono } from "next/font/google";
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
  metadataBase: new URL("https://kasptrax.com"),
  title: "kasp — Brooklyn producer / DJ",
  description:
    "Kasp is a Brooklyn-based producer and DJ channeling Y2K eurodance, vocal trance, UKG, speed garage, and modern club pressure.",
  openGraph: {
    title: "kasp — Brooklyn producer / DJ",
    description:
      "Brooklyn-based producer and DJ channeling Y2K eurodance, vocal trance, UKG, speed garage, and modern club pressure.",
    images: ["/assets/kasp/promo-shots/selected/kasp-primary-bw-headphones.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anybody.variable} ${jetbrainsMono.variable} ${darkerGrotesque.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
