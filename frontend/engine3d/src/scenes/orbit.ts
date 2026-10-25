import type { PlanetState } from "@athena/shared";
import { buildAthenaOrbit } from "../athena/orbit";
import type { AthenaInstallation } from "../athena/install";
import { diveDistance, orbitDive, orbitExtent, orbitLayout } from "../config/orbit";
import type { PlanetKind } from "../config/orbit";
import { createEngineContext, disposeEngineContext } from "../runtime/context";
import type { LegacyContext } from "../runtime/legacy-context";
import { prefersReducedMotion } from "../athena/models";
import type { EngineStats } from "./surface";

export interface ProjectedPlanet {
  studentId: string;
  x: number;
  y: number;
  /** On-screen planet radius in CSS pixels (labels sit just below it). */
  radius: number;
  /** Normalised depth (smaller is nearer the camera); used to declutter labels. */
  depth: number;
  visible: boolean;
}
/** Kit-sized frame the original camera was tuned for (outer ring + margin). */
const FRAME_REFERENCE = 12.25;
const CLASS_FOV = 42;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const easeOut = (x: number) => 1 - (1 - Math.min(1, x)) ** 3;
export interface OrbitOptions {
  signal?: AbortSignal;
  onPlanetClick?: (planet: PlanetState) => void;
  onProjection?: (planets: ProjectedPlanet[]) => void;
  onStats?: (stats: EngineStats) => void;
  /** Resolve assets through the Athena manifest first (default true). */
  athenaAssets?: boolean;
  /** Open already dived into this student's planet (returning from their world). */
  focus?: string;
  /** Student planet look for the class (Athena only). Default `earth`. */
  planetKind?: PlanetKind | ((state: PlanetState, index: number) => PlanetKind);
}
/** One shared canvas/renderer and geometry cache, regardless of planet count. */
export async function createOrbitEngine(
  host: HTMLElement,
  initial: PlanetState[],
  options: OrbitOptions = {},
) {
  const { scope, lifecycle } = await createEngineContext({ athenaAssets: options.athenaAssets });
  let disposed = false;
  let states = initial;
  const objects: LegacyContext[] = [];
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    disposeEngineContext(scope, lifecycle);
    host.replaceChildren();
  };
  options.signal?.addEventListener("abort", dispose, { once: true });
  try {
    if (options.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    await scope.global$1.init({
      canvasCnt: host,
      relativePath: "",
      fingers: 2,
      contextMenu: false,
      DPR: Math.min(window.devicePixelRatio, 1.5),
      adaptiveDPR: false,
      shadowMap: false,
    });
    const athena = scope.athena as AthenaInstallation | undefined;
    if (athena?.enabled) {
      const scene = new scope.Scene();
      scene.background = new scope.Color(orbitLayout.background);
      const camera = new scope.PerspectiveCamera(
        CLASS_FOV,
        host.clientWidth / host.clientHeight,
        0.1,
        200,
      );
      // Frame the whole class: the camera backs off as more rings are needed.
      const frame = (orbitExtent(initial.length) + 2.2) / FRAME_REFERENCE;
      const home = new scope.Vector3(0, 9.5 * frame + 1.2, 19 * frame + 1);
      const homeLook = new scope.Vector3(0, orbitLayout.sunHeight, 0);
      camera.position.copy(home);
      camera.lookAt(homeLook);
      scope.global$1.renderPass.scene = scene;
      scope.global$1.renderPass.camera = camera;
      const orbit = await buildAthenaOrbit(athena, initial, { planetKind: options.planetKind });
      if (disposed) throw new DOMException("Aborted", "AbortError");
      scene.add(orbit.root);
      const raycaster = new scope.Raycaster();
      const mouse = new scope.Vector2();
      const point = new scope.Vector3();
      const edge = new scope.Vector3();
      const cameraRight = new scope.Vector3();
      // Visit dive: `weight` runs 0 → 1 as the camera dives from the class to one planet (and
      // back). Orbits pause under it, the rest of the class shrinks away, the planet turns into
      // full view, and the dive ends on the world's overview framing (config/orbit.ts).
      let focusId = options.focus && orbit.positions.has(options.focus) ? options.focus : null;
      let diveId = focusId;
      let weight = focusId ? 1 : 0;
      let orbitClock = 0;
      let settled: (() => void)[] = [];
      const settle = () => {
        const pending = settled;
        settled = [];
        for (const resolve of pending) resolve();
      };
      const look = new scope.Vector3();
      const away = new scope.Vector3();
      const turned = new scope.Vector3();
      const outward = new scope.Vector3();
      let previous = 0;
      lifecycle.listen(scope.global$1.renderer.domElement, "pointerup", ((event: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        mouse.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          (-(event.clientY - rect.top) / rect.height) * 2 + 1,
        );
        // A visit owns the view: planets are not picked until the camera is back with the class.
        if (focusId || weight > 0) return;
        raycaster.setFromCamera(mouse, camera);
        const studentId = orbit.pick(raycaster);
        const selected = states.find((state) => state.studentId === studentId);
        if (selected) options.onPlanetClick?.(selected);
      }) as EventListener);
      lifecycle.listen(window, "resize", () => {
        camera.aspect = host.clientWidth / host.clientHeight;
        camera.updateProjectionMatrix();
      });
      let last = 0;
      scope.events$1.on("prerender", () => {
        // Wall-clock time: the runtime's render clock is shared with a world being built
        // alongside (prepared during the dive) and drifts. The dive follows real elapsed time
        // even through a long frame; orbits keep the clamped step.
        const time = performance.now() / 1000;
        const elapsed = previous ? Math.min(0.5, Math.max(0, time - previous)) : 0;
        const dt = Math.min(0.1, elapsed);
        previous = time;
        // Switching planets climbs out to the class first, then dives into the next one.
        if (weight === 0) diveId = focusId;
        const goal = focusId && focusId === diveId ? 1 : 0;
        if (prefersReducedMotion()) weight = goal;
        else if (weight < goal) weight = Math.min(1, weight + elapsed / orbitDive.inSeconds);
        else weight = Math.max(goal, weight - elapsed / orbitDive.outSeconds);
        if (weight === 0) diveId = focusId;
        const e = easeInOut(weight);
        orbitClock += dt * (1 - e);
        orbit.stage(diveId, 1 - easeOut(weight / 0.6), e * orbitDive.turn);
        orbit.tick(orbitClock, time);
        const planet = diveId && weight > 0 ? orbit.positions.get(diveId) : undefined;
        let fov = CLASS_FOV;
        if (planet) {
          // Dolly in log-distance (steady perceived speed) and swing a little towards the
          // planet's sunlit face; the look leads so the planet centres before it fills the view.
          away.copy(home).sub(planet);
          const from = away.length();
          away.normalize();
          outward.set(planet.x, 0, planet.z).normalize();
          turned.copy(away).addScaledVector(outward, -0.45).normalize();
          away.lerp(turned, e).normalize();
          const to = diveDistance(orbit.radii.get(diveId!) ?? 0.5);
          camera.position.copy(planet).addScaledVector(away, from * (to / from) ** e);
          look.lerpVectors(homeLook, planet, easeOut(weight * 1.6));
          fov =
            CLASS_FOV + (orbitDive.fov - CLASS_FOV) * e + orbitDive.fovRush * Math.sin(Math.PI * e);
        } else {
          camera.position.copy(home);
          look.copy(homeLook);
        }
        if (camera.fov !== fov) {
          camera.fov = fov;
          camera.updateProjectionMatrix();
        }
        camera.lookAt(look);
        camera.updateMatrixWorld();
        if (!focusId || (weight === 1 && diveId === focusId)) settle();
        // Labels follow every frame (no throttling), positioned by the UI without re-renders.
        cameraRight.setFromMatrixColumn(camera.matrixWorld, 0);
        options.onProjection?.(
          states.map((state) => {
            const centre = orbit.positions.get(state.studentId) ?? point;
            edge.copy(centre).addScaledVector(cameraRight, orbit.radii.get(state.studentId) ?? 0.5);
            point.copy(centre).project(camera);
            edge.project(camera);
            return {
              studentId: state.studentId,
              x: ((point.x + 1) * host.clientWidth) / 2,
              y: ((1 - point.y) * host.clientHeight) / 2,
              radius: (Math.abs(edge.x - point.x) * host.clientWidth) / 2,
              depth: point.z,
              visible: point.z < 1,
            };
          }),
        );
        if (time - last < 0.5) return;
        last = time;
        options.onStats?.({
          fps: scope.renderInfo.averageFPS || 0,
          drawCalls: scope.global$1.renderer.info.render.calls,
          triangles: scope.global$1.renderer.info.render.triangles,
          planets: states.length,
        });
      });
      scope.events$1.emit("render_active", true);
      return {
        update(next: PlanetState[]) {
          states = next;
          orbit.update(next);
        },
        /**
         * Dive to a student's planet (`null` climbs back to the whole class). Resolves once the
         * camera has settled on the planet in the world's overview framing.
         */
        focus(studentId: string | null) {
          focusId = studentId && orbit.positions.has(studentId) ? studentId : null;
          return new Promise<void>((resolve) => settled.push(resolve));
        },
        dispose,
        get resourceCounts() {
          return lifecycle.counts;
        },
      };
    }
    // Legacy Messenger planets (athenaAssets: false): kept for A/B comparison.
    const scene = new scope.Scene();
    scene.background = new scope.Color("#172f3a");
    const camera = new scope.PerspectiveCamera(42, host.clientWidth / host.clientHeight, 0.1, 400);
    camera.position.set(0, 48, 72);
    camera.lookAt(0, 0, 0);
    scope.global$1.renderPass.scene = scene;
    scope.global$1.renderPass.camera = camera;
    const [terrain, trees, water] = await Promise.all([
      scope.geometryLoader.load("planets/present/intro/low/planet.drc"),
      scope.geometryLoader.load("planets/present/intro/trees.drc"),
      scope.geometryLoader.load("planets/present/intro/water.drc"),
    ]);
    if (disposed) throw new DOMException("Aborted", "AbortError");
    const atlas = scope.textureLoader.load("atlas.png", "srgb-nearest");
    await atlas;
    const material = new scope.MeshBasicMaterial({ map: atlas });
    const waterMaterial = new scope.MeshBasicMaterial({
      color: "#64bbb5",
      transparent: true,
      opacity: 0.78,
    });
    initial.forEach((state, index) => {
      const group = new scope.Group();
      const angle = (index / initial.length) * Math.PI * 2;
      group.position.set(Math.cos(angle) * 24, Math.sin(angle * 2) * 2.5, Math.sin(angle) * 20);
      group.scale.setScalar(0.085 + state.growth * 0.025);
      group.add(
        new scope.Mesh(terrain, material),
        new scope.Mesh(trees, material),
        new scope.Mesh(water, waterMaterial),
      );
      group.userData.studentId = state.studentId;
      scene.add(group);
      objects.push(group);
    });
    const orbit = new scope.Mesh(
      new scope.RingGeometry(23.85, 23.92, 128),
      new scope.MeshBasicMaterial({
        color: "#527781",
        side: scope.DoubleSide,
        transparent: true,
        opacity: 0.65,
      }),
    );
    orbit.rotation.x = -Math.PI / 2;
    orbit.scale.y = 20 / 24;
    scene.add(orbit);
    const stars = new Float32Array(150 * 3);
    // Deterministic backdrop: appearance does not change with student activity.
    for (let i = 0; i < stars.length; i++) {
      stars[i] = Math.sin(i * 127.1) * 80;
    }
    const starGeometry = new scope.BufferGeometry();
    starGeometry.setAttribute("position", new scope.BufferAttribute(stars, 3));
    scene.add(
      new scope.Points(
        starGeometry,
        new scope.PointsMaterial({
          color: "#c9dedb",
          size: 0.18,
          transparent: true,
          opacity: 0.65,
        }),
      ),
    );
    const raycaster = new scope.Raycaster();
    const mouse = new scope.Vector2();
    const point = new scope.Vector3();
    lifecycle.listen(scope.global$1.renderer.domElement, "pointerup", ((event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      mouse.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObjects(objects, true)[0];
      let object = hit?.object;
      while (object && !object.userData.studentId) object = object.parent;
      const selected = states.find((state) => state.studentId === object?.userData.studentId);
      if (selected) options.onPlanetClick?.(selected);
    }) as EventListener);
    lifecycle.listen(window, "resize", () => {
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
    });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = 0;
    scope.events$1.on("prerender", () => {
      objects.forEach((group, index) => {
        if (!reduced) group.rotation.y = scope.renderInfo.time * 0.025 + index * 0.45;
      });
      if (scope.renderInfo.time - last < 0.1) return;
      last = scope.renderInfo.time;
      options.onProjection?.(
        objects.map((group) => {
          point.copy(group.position).project(camera);
          return {
            studentId: group.userData.studentId,
            x: ((point.x + 1) * host.clientWidth) / 2,
            y: ((1 - point.y) * host.clientHeight) / 2,
            radius: 28,
            depth: point.z,
            visible: point.z < 1,
          };
        }),
      );
      options.onStats?.({
        fps: scope.renderInfo.averageFPS || 0,
        drawCalls: scope.global$1.renderer.info.render.calls,
        triangles: scope.global$1.renderer.info.render.triangles,
        planets: objects.length,
      });
    });
    scope.events$1.emit("render_active", true);
    return {
      update(next: PlanetState[]) {
        states = next;
        objects.forEach((group) => {
          const state = next.find((item) => item.studentId === group.userData.studentId);
          if (state) group.scale.setScalar(0.085 + state.growth * 0.025);
        });
      },
      focus() {
        return Promise.resolve();
      },
      dispose,
      get resourceCounts() {
        return lifecycle.counts;
      },
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
