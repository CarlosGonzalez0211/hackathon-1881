"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import {
  defaultContentAccessibility,
  type ContentAccessibility,
  type ContentPreferences,
} from "@athena/shared";
import { contentStrings, type ContentStrings } from "../strings";

interface ContentView {
  t: ContentStrings;
  locale: ContentPreferences["locale"];
  a11y: ContentAccessibility;
}

const ContentViewContext = createContext<ContentView>({
  t: contentStrings("es"),
  locale: "es",
  a11y: defaultContentAccessibility,
});

/** Strings, locale and accessibility settings for everything under ContentA11yRoot. */
export const useContentView = () => useContext(ContentViewContext);

/**
 * Applies the viewer's profile settings to the content screens: language (lang + strings),
 * text size, higher contrast, reading spacing (dyslexia setting) and reduced motion.
 * The OS-level prefers-reduced-motion and prefers-contrast rules in the brand tokens still apply.
 */
export function ContentA11yRoot({
  preferences,
  children,
}: {
  preferences: ContentPreferences;
  children: ReactNode;
}) {
  const { locale, accessibility: a11y } = preferences;
  const style: CSSProperties & Record<`--${string}`, string> = {};
  if (a11y.fontScale !== 1) style.zoom = a11y.fontScale;
  if (a11y.highContrast) {
    style["--athena-muted"] = "#1b2433";
    style["--athena-border"] = "#1b2433";
    style["--athena-hairline"] = "#4a5568";
  }
  if (a11y.dyslexiaFont) {
    style.letterSpacing = "0.05em";
    style.wordSpacing = "0.12em";
    style.lineHeight = 1.8;
  }
  return (
    <ContentViewContext.Provider value={{ t: contentStrings(locale), locale, a11y }}>
      <div
        lang={locale}
        style={style}
        data-reduced-motion={a11y.reducedMotion || undefined}
        className="data-[reduced-motion]:[&_*]:!transition-none data-[reduced-motion]:[&_*]:!animate-none"
      >
        {children}
      </div>
    </ContentViewContext.Provider>
  );
}
