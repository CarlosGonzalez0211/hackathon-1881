import type { HouseState } from "@athena/shared";
import { houseStateVisuals } from "@athena/brand";
import locked from "@athena/engine3d/icons/state-locked.svg";
import available from "@athena/engine3d/icons/state-available.svg";
import inProgress from "@athena/engine3d/icons/state-in_progress.svg";
import done from "@athena/engine3d/icons/state-done.svg";

type Status = HouseState["status"];
const icons: Record<Status, { src: string }> = {
  locked,
  available,
  in_progress: inProgress,
  done,
};

/** Spanish label of a learning state (brand guide 05: same labels in ES/EN). */
export const stateLabel = (status: Status) => houseStateVisuals[status].es;

/**
 * Learning-state shape from the kit (`state-*.svg`), drawn on the state colour token.
 * Decorative: callers always render the text label next to it (shape + text + colour).
 */
export function StateIcon({ status, size = 16 }: { status: Status; size?: number }) {
  return (
    <img
      className={`state-icon ${status}`}
      src={icons[status].src}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
    />
  );
}
