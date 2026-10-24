import type { Metadata, Viewport } from "next";

import "@athena/brand/tokens.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "Athena",
  description: "Un espacio de aprendizaje para explorar temas y comprender a tu ritmo.",
};

export const viewport: Viewport = { themeColor: "#172f3a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
