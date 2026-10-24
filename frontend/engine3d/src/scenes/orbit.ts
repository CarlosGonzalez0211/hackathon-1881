import type { PlanetState } from "@athena/shared";
import { createEngineContext, disposeEngineContext } from "../runtime/context";
import type { LegacyContext } from "../runtime/legacy-context";
import type { EngineStats } from "./surface";

export interface ProjectedPlanet {
  studentId: string;
  x: number;
  y: number;
  visible: boolean;
}
export interface OrbitOptions {
  signal?: AbortSignal;
  onPlanetClick?: (planet: PlanetState) => void;
  onProjection?: (planets: ProjectedPlanet[]) => void;
  onStats?: (stats: EngineStats) => void;
}
/** One shared canvas/renderer and geometry cache, regardless of planet count. */
export async function createOrbitEngine(
  host: HTMLElement,
  initial: PlanetState[],
  options: OrbitOptions = {},
) {
  const { scope, lifecycle } = await createEngineContext();
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
