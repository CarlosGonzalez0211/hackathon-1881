import { appLocale, t } from "@/lib/i18n";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { athenaBrand } from "@athena/brand";
import "@athena/brand/tokens.css";
import "./globals.css";
import "./paper-ui.css";

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
  description: t("A learning world to explore topics and understand at your own pace."),
};

export const viewport: Viewport = {
  themeColor: athenaBrand.colors.ink,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={appLocale} className={comfortaa.variable}>
      <body>{children}</body>
    </html>
  );
}
