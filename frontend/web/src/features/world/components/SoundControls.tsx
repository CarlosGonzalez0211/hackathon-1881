"use client";
import { t } from "@/lib/i18n";

import { Tooltip } from "@/components/ui/Tooltip";
import { WorldSketchIcon } from "./WorldSketchIcon";
import { useId, useRef, useState } from "react";
import { useOutsideDismiss } from "@/components/ui/useOutsideDismiss";
import "../world.css";

export interface Volumes {
  music: number;
  effects: number;
}

/**
 * Sound stays off until the student turns it on (first gesture); music and effects have
 * separate sliders (brand guide 07). Volumes apply live through the engine handle.
 */
export function SoundControls({
  muted,
  onMutedChange,
  volumes,
  onVolumesChange,
}: {
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
  volumes: Volumes;
  onVolumesChange: (volumes: Volumes) => void;
}) {
  const id = useId();
  const ref = useRef<HTMLFieldSetElement>(null);
  const [open, setOpen] = useState(false);
  useOutsideDismiss(ref, open, () => setOpen(false));
  return (
    <fieldset ref={ref} className="sound-controls">
      <legend className="visually-hidden">{t("Sound")}</legend>
      <Tooltip label={muted ? t("Turn sound on") : t("Mute sound")}>
        <button
          className="world-tool"
          type="button"
          onClick={() => {
            onMutedChange(!muted);
            setOpen(muted);
          }}
          aria-pressed={!muted}
          aria-label={muted ? t("Turn sound on") : t("Mute sound")}
        >
          <WorldSketchIcon kind="sound" muted={muted} />
        </button>
      </Tooltip>
      {!muted && open && (
        <div className="sound-mixer toon-paper">
          <label htmlFor={`${id}-music`}>{t("Music")}</label>
          <input
            id={`${id}-music`}
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volumes.music}
            onChange={(event) => onVolumesChange({ ...volumes, music: Number(event.target.value) })}
          />
          <label htmlFor={`${id}-effects`}>{t("Effects")}</label>
          <input
            id={`${id}-effects`}
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volumes.effects}
            onChange={(event) =>
              onVolumesChange({ ...volumes, effects: Number(event.target.value) })
            }
          />
        </div>
      )}
    </fieldset>
  );
}
