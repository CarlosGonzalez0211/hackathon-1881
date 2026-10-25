"use client";
import { WorldSketchIcon } from "./WorldSketchIcon";
import { useId } from "react";
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
  return (
    <fieldset className="sound-controls">
      <legend className="visually-hidden">Sonido</legend>
      <button
        className="world-tool"
        title={muted ? "Activar sonido" : "Silenciar sonido"}
        type="button"
        onClick={() => onMutedChange(!muted)}
        aria-pressed={!muted}
        aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
      >
        <WorldSketchIcon kind="sound" muted={muted} />
      </button>
      {!muted && (
        <div className="sound-mixer toon-paper">
          <label htmlFor={`${id}-music`}>Música</label>
          <input
            id={`${id}-music`}
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volumes.music}
            onChange={(event) => onVolumesChange({ ...volumes, music: Number(event.target.value) })}
          />
          <label htmlFor={`${id}-effects`}>Efectos</label>
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
