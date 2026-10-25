import type { PlanetState } from "@athena/shared";
import { buildAthenaOrbit } from "../athena/orbit";
import type { AthenaInstallation } from "../athena/install";
import { orbitExtent, orbitLayout } from "../config/orbit";
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
export interface OrbitOptions {
  signal?: AbortSignal;
  onPlanetClick?: (planet: PlanetState) => void;
  onProjection?: (planets: ProjectedPlanet[]) => void;
  onStats?: (stats: EngineStats) => void;
  /** Resolve assets through the Athena manifest first (default true). */
  athenaAssets?: boolean;
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
        42,
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
      // Visit: the camera glides to circle one classmate's planet, then back to the class.
      let focusId: string | null = null;
      const look = homeLook.clone();
      const targetPosition = new scope.Vector3();
      const targetLook = new scope.Vector3();
      const outward = new scope.Vector3();
      let previous = 0;
      lifecycle.listen(scope.global$1.renderer.domElement, "pointerup", ((event: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        mouse.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          (-(event.clientY - rect.top) / rect.height) * 2 + 1,
        );
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
        const time = scope.renderInfo.time;
        const dt = Math.min(0.1, Math.max(0, time - previous));
        previous = time;
        orbit.tick(time);
        const focused = focusId ? orbit.positions.get(focusId) : undefined;
        if (focused) {
          const r = orbit.radii.get(focusId!) ?? 0.5;
          outward.set(focused.x, 0, focused.z).normalize();
          targetPosition
            .copy(focused)
            .addScaledVector(outward, r * 5 + 1.4)
            .add(new scope.Vector3(0, r * 2.2 + 0.7, 0));
          targetLook.copy(focused);
        } else {
          targetPosition.copy(home);
          targetLook.copy(homeLook);
        }
        const ease = prefersReducedMotion() ? 1 : 1 - Math.exp(-dt * 3.2);
        camera.position.lerp(targetPosition, ease);
        look.lerp(targetLook, ease);
        camera.lookAt(look);
        camera.updateMatrixWorld();
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
        /** Glide to a student's planet (`null` returns to the whole class). */
        focus(studentId: string | null) {
          focusId = studentId && orbit.positions.has(studentId) ? studentId : null;
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
      focus() {},
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
