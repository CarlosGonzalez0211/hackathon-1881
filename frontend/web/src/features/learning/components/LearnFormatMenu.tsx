"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { t } from "@/lib/i18n";
import { Tooltip } from "@/components/ui/Tooltip";
import { useOutsideDismiss } from "@/components/ui/useOutsideDismiss";
import styles from "./LearnFormatMenu.module.css";

export type LearnFormat =
  | "podcast"
  | "lecture"
  | "video"
  | "reel"
  | "worked_example"
  | "flashcards"
  | "visual_summary"
  | "story";

interface FormatOption {
  id: LearnFormat;
  label: string;
  hint: string;
  /** Request placed in the composer; the tutor answers it as a script or text. */
  prompt: string;
  icon: ReactNode;
}

// Hardcoded until Learning exposes the student's observed learning style.
const RECOMMENDED: LearnFormat = "podcast";

const OPTIONS: FormatOption[] = [
  {
    id: "podcast",
    label: "Podcast",
    hint: "Two voices talk the topic through",
    prompt: "Teach me this topic as a short podcast script with two hosts.",
    icon: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" fill="#f0d79a" />
        <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" />
      </>
    ),
  },
  {
    id: "lecture",
    label: "Lecture",
    hint: "A guided explanation, step by step",
    prompt: "Teach me this topic as a short lecture, step by step.",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="11" rx="1.5" fill="#dfe8d2" />
        <path d="M7 8h7M7 11h4M12 15v3M8 21l4-3 4 3" />
      </>
    ),
  },
  {
    id: "video",
    label: "Video",
    hint: "A scene-by-scene video script",
    prompt: "Teach me this topic as a short video script, scene by scene.",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" fill="#cfe1ea" />
        <path d="m10 9 5 3-5 3Z" fill="#514b3e" />
      </>
    ),
  },
  {
    id: "reel",
    label: "Reel",
    hint: "A 30-second vertical reel",
    prompt: "Teach me this topic as a 30-second reel script.",
    icon: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" fill="#efd0d8" />
        <path d="M10 5.5h4M11 11l3 1.7-3 1.8Z" />
      </>
    ),
  },
  {
    id: "worked_example",
    label: "Worked example",
    hint: "Solve one problem with every step shown",
    prompt: "Teach me this topic with a fully worked example.",
    icon: (
      <>
        <path d="M4 20 15 9l3 3L7 23H4Z" fill="#f0d79a" transform="translate(0 -3)" />
        <path d="m15 6 3 3M17 4l3 3-2 2-3-3Z" />
      </>
    ),
  },
  {
    id: "flashcards",
    label: "Flashcards",
    hint: "Quick question and answer cards",
    prompt: "Make me flashcards for this topic.",
    icon: (
      <>
        <rect
          x="6"
          y="3"
          width="14"
          height="10"
          rx="1.5"
          fill="#e4dcf3"
          transform="rotate(8 13 8)"
        />
        <rect x="3" y="9" width="14" height="10" rx="1.5" fill="#fffbef" />
        <path d="M7 13h6M7 16h4" />
      </>
    ),
  },
  {
    id: "visual_summary",
    label: "Visual summary",
    hint: "The idea broken into labeled parts",
    prompt: "Give me a visual summary of this topic, broken into labeled parts.",
    icon: (
      <>
        <circle cx="12" cy="6" r="3" fill="#d6ead9" />
        <circle cx="5.5" cy="17" r="3" fill="#f0d79a" />
        <circle cx="18.5" cy="17" r="3" fill="#cfe1ea" />
        <path d="m10.5 8.5-3.5 6M13.5 8.5l3.5 6M8.5 17h7" />
      </>
    ),
  },
  {
    id: "story",
    label: "Story",
    hint: "A short story that frames the idea",
    prompt: "Teach me this topic through a short story.",
    icon: (
      <>
        <path d="M3 5q5-2 9 1 4-3 9-1v14q-5-2-9 1-4-3-9-1Z" fill="#f4e6c4" />
        <path d="M12 6v14" />
      </>
    ),
  },
];

/** Pill that lets the student pick how the tutor should teach the topic next. */
export function LearnFormatMenu({ onPick }: { onPick: (prompt: string) => void }) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<LearnFormat | null>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideDismiss(root, open, close);

  useEffect(() => {
    if (!open) return;
    const start = Math.max(
      0,
      OPTIONS.findIndex((option) => option.id === (chosen ?? RECOMMENDED)),
    );
    items.current[start]?.focus();
  }, [open, chosen]);

  const move = (event: KeyboardEvent<HTMLUListElement>) => {
    const current = items.current.findIndex((item) => item === document.activeElement);
    const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      items.current[event.key === "Home" ? 0 : OPTIONS.length - 1]?.focus();
    } else if (step) {
      event.preventDefault();
      items.current[(current + step + OPTIONS.length) % OPTIONS.length]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  const pick = (option: FormatOption) => {
    setChosen(option.id);
    setOpen(false);
    onPick(t(option.prompt));
  };

  const current = OPTIONS.find((option) => option.id === chosen);
  return (
    <div className={styles.root} ref={root}>
      <button
        type="button"
        className={styles.pill}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => setOpen((value) => !value)}
      >
        <svg className={styles.pillIcon} viewBox="0 0 24 24" aria-hidden="true">
          {current ? (
            current.icon
          ) : (
            <path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2Z" fill="#f0d79a" />
          )}
        </svg>
        <span>{current ? t("Learn: {0}", { 0: t(current.label) }) : t("Learn")}</span>
        <svg className={styles.caret} viewBox="0 0 12 12" aria-hidden="true">
          <path d="m3 4.5 3 3 3-3" />
        </svg>
      </button>
      {open ? (
        <div className={styles.menu} id={`${id}-menu`}>
          <p className={styles.menuTitle}>{t("How do you want to learn this?")}</p>
          <ul role="menu" aria-label={t("Learning formats")} onKeyDown={move}>
            {OPTIONS.map((option, index) => {
              const recommended = option.id === RECOMMENDED;
              return (
                <li key={option.id} role="none" className={styles.row}>
                  <button
                    ref={(node) => {
                      items.current[index] = node;
                    }}
                    type="button"
                    role="menuitemradio"
                    aria-checked={chosen === option.id}
                    aria-describedby={recommended ? `${id}-why` : undefined}
                    className={styles.item}
                    data-recommended={recommended || undefined}
                    onClick={() => pick(option)}
                  >
                    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
                      {option.icon}
                    </svg>
                    <span className={styles.text}>
                      <span className={styles.titleRow}>
                        <strong>{t(option.label)}</strong>
                        {recommended ? (
                          <Tooltip
                            label={t("Recommended from the way you have been learning so far")}
                          >
                            <span className={styles.badge}>{t("Recommended")}</span>
                          </Tooltip>
                        ) : null}
                      </span>
                      <span>{t(option.hint)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <span id={`${id}-why`} className={styles.srOnly}>
            {t("Recommended from the way you have been learning so far")}
          </span>
        </div>
      ) : null}
    </div>
  );
}
