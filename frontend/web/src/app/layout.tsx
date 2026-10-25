import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { athenaBrand } from "@athena/brand";
import "@athena/brand/tokens.css";
import "./globals.css";

// Comfortaa is locally served with the app. The variable font covers weights 300–700.
const comfortaa = localFont({
  src: "./fonts/Comfortaa-Variable.ttf",
  display: "swap",
  weight: "300 700",
  variable: "--font-comfortaa",
  fallback: ["Arial Rounded MT Bold", "system-ui", "sans-serif"],
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
    <html lang="es" className={comfortaa.variable}>
      <body>{children}</body>
    </html>
  );
}
