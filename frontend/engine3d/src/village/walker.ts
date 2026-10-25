import {
  advance,
  add,
  canOccupy,
  cross,
  mul,
  norm,
  spawnDirection,
  tangent,
  walkingRadius,
  doorDirection,
  type Obstacle,
  type Vec,
} from "./layout";

export class SphericalWalker {
  up: Vec = spawnDirection;
  forward: Vec = tangent(doorDirection(0), this.up);
  facing: Vec = this.forward;
  altitude = 0;
  verticalSpeed = 0;
  moving = false;
  sprinting = false;
  private accumulator = 0;
  constructor(
    readonly obstacles: readonly Obstacle[],
    private readonly floor: (up: Vec) => number = walkingRadius,
  ) {}
  get position(): Vec {
    return mul(this.up, this.floor(this.up) + this.altitude);
  }
  jump() {
    if (this.altitude === 0) this.verticalSpeed = 5.3;
  }
  step(seconds: number, x: number, y: number, sprint: boolean) {
    this.accumulator += Math.min(seconds, 0.1);
    this.moving = Math.hypot(x, y) > 0.08;
    this.sprinting = sprint && this.moving;
    const step = 1 / 120;
    while (this.accumulator + 1e-9 >= step) {
      this.accumulator -= step;
      if (this.moving) {
        const right = cross(this.forward, this.up);
        const velocity = norm(add(mul(right, x), mul(this.forward, y)));
        const meters = (sprint ? 7 : 4.2) * step * Math.min(1, Math.hypot(x, y));
        let next = advance(this.up, velocity, meters);
        if (!canOccupy(next.up, this.obstacles)) {
          // Slide along a wall instead of trapping diagonal input at its edge.
          const alternatives = [
            advance(this.up, right, meters * x),
            advance(this.up, this.forward, meters * y),
          ];
          const free = alternatives.find((candidate) => canOccupy(candidate.up, this.obstacles));
          if (free) next = free;
          else {
            this.moving = false;
            next = { up: this.up, heading: velocity };
          }
        }
        this.up = next.up;
        this.forward = tangent(this.forward, this.up);
        this.facing = tangent(velocity, this.up);
      }
      if (this.altitude > 0 || this.verticalSpeed > 0) {
        this.verticalSpeed -= 13.5 * step;
        this.altitude = Math.max(0, this.altitude + this.verticalSpeed * step);
        if (this.altitude === 0) this.verticalSpeed = 0;
      }
    }
  }
}
