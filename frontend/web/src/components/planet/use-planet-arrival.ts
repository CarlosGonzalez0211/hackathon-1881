"use client";
import { useEffect, useState } from "react";
import { arrivalFor, reducedMotion, releaseArrival, revealWhenDrawn } from "./arrival";

/**
 * World side of the orbit ↔ world shot. Arriving from the orbit dive, the world opens on the
 * planet overview the dive ended on, fades the held orbit shot once drawn, then lands the
 * camera on the student. `leave()` reverses it: the camera rises to the overview and the
 * surface hands its canvas to the orbit (Planet `leaving` / `onLeft`).
 */
export function usePlanetArrival(error?: string | null) {
  const [arriving] = useState(() => arrivalFor("world") !== null);
  const [overview, setOverview] = useState(() => arriving && !reducedMotion());
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    // A world that cannot open never keeps the orbit shot on top.
    if (error) releaseArrival();
  }, [error]);
  return {
    overview,
    setOverview,
    leaving,
    /** Surface `onReady`. */
    onReady() {
      if (arriving) revealWhenDrawn(() => !reducedMotion() && setOverview(false));
    },
    leave() {
      if (leaving) return;
      setOverview(true);
      setLeaving(true);
    },
  };
}
