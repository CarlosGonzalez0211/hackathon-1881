import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, IBM_Plex_Mono, Newsreader } from "next/font/google";

import { athenaBrand } from "@athena/brand";
import "@athena/brand/tokens.css";

import "./globals.css";

// Brand guide 03: display Newsreader 400/500, body Atkinson Hyperlegible Next 400/600/700,
// mono IBM Plex Mono 400/500. Exposed as CSS variables consumed by --athena-font-*.
const display = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-athena-display",
});

const body = Atkinson_Hyperlegible_Next({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-athena-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-athena-mono",
});

export const metadata: Metadata = {
  title: "Athena",
  description: "Un espacio de aprendizaje para explorar temas y comprender a tu ritmo.",
};

export const viewport: Viewport = {
  themeColor: athenaBrand.colors.ink,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
